import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Configuration ---
const DAILY_ALERT_THRESHOLD = 1000;    // Send alert if >1000 requests in a day
const MONTHLY_ALERT_THRESHOLD = 400000; // 80% of 500k free tier
const FREE_TIER_LIMIT = 500000;

// --- Upstash Redis Client (lazy init) ---
let redis: Redis | null = null;
let redisAvailable = true; // Flip to false on connection failure

function getRedis(): Redis | null {
  if (!redisAvailable) return null;
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    redis = new Redis({ url, token });
    return redis;
  } catch {
    redisAvailable = false;
    return null;
  }
}

// --- Rate Limiter Instances (lazy init, cached) ---
const limiters = new Map<string, Ratelimit>();

type RateLimitTier = {
  limit: number;
  window: `${number} s` | `${number} m` | `${number} h`;
};

const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  auth:     { limit: 5,  window: "60 s" },    // login/register
  payment:  { limit: 3,  window: "60 s" },    // checkout, gift-card purchase
  form:     { limit: 5,  window: "60 s" },    // contact, inquiries, applications
  lookup:   { limit: 15, window: "60 s" },    // gift-card lookup, membership/me
  admin:    { limit: 30, window: "60 s" },    // admin operations
  subscribe:{ limit: 3,  window: "60 s" },    // email newsletter
};

function getLimiter(tier: string): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  if (limiters.has(tier)) return limiters.get(tier)!;

  const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.form;
  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `ratelimit:${tier}`,
    analytics: false, // Avoid extra Redis commands
  });
  limiters.set(tier, limiter);
  return limiter;
}

// --- In-memory alert dedup (one alert per day per instance) ---
let lastDailyAlert = "";
let lastMonthlyAlert = "";

// --- Public API ---

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  source: "upstash" | "memory" | "none";
};

/**
 * Check rate limit using Upstash Redis.
 * Falls through gracefully to { allowed: true } if Upstash is unavailable.
 */
export async function checkRateLimit(
  identifier: string,
  tier: string = "form"
): Promise<RateLimitResult> {
  const limiter = getLimiter(tier);
  if (!limiter) {
    // Upstash not configured or unavailable — allow through
    const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.form;
    return { allowed: true, limit: config.limit, remaining: config.limit, reset: 0, source: "none" };
  }

  try {
    const result = await limiter.limit(identifier);

    // Track usage (non-blocking, fire-and-forget)
    trackUsage().catch(() => {});

    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      source: "upstash",
    };
  } catch {
    // Upstash unreachable — gracefully degrade
    redisAvailable = false;
    const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.form;
    return { allowed: true, limit: config.limit, remaining: config.limit, reset: 0, source: "none" };
  }
}

/**
 * Track daily and monthly command usage in Redis.
 * Sends email alerts when thresholds are crossed.
 */
async function trackUsage(): Promise<void> {
  const r = getRedis();
  if (!r) return;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const monthKey = today.slice(0, 7); // YYYY-MM
  const dailyKey = `ratelimit:usage:${today}`;
  const monthlyKey = `ratelimit:usage:month:${monthKey}`;

  try {
    const [dailyCount, monthlyCount] = await Promise.all([
      r.incr(dailyKey),
      r.incr(monthlyKey),
    ]);

    // Set expiry on daily key (48 hours to allow querying yesterday)
    if (dailyCount === 1) {
      await r.expire(dailyKey, 48 * 60 * 60);
    }
    // Set expiry on monthly key (35 days)
    if (monthlyCount === 1) {
      await r.expire(monthlyKey, 35 * 24 * 60 * 60);
    }

    // Check daily threshold
    if (dailyCount >= DAILY_ALERT_THRESHOLD && lastDailyAlert !== today) {
      lastDailyAlert = today;
      sendUsageAlert("daily", dailyCount, DAILY_ALERT_THRESHOLD).catch(() => {});
    }

    // Check monthly threshold
    if (monthlyCount >= MONTHLY_ALERT_THRESHOLD && lastMonthlyAlert !== monthKey) {
      lastMonthlyAlert = monthKey;
      sendUsageAlert("monthly", monthlyCount, FREE_TIER_LIMIT).catch(() => {});
    }
  } catch {
    // Non-critical — don't let tracking failures affect requests
  }
}

/**
 * Send usage alert email via Resend.
 */
async function sendUsageAlert(
  period: "daily" | "monthly",
  currentCount: number,
  maxCount: number
): Promise<void> {
  // Dynamic import to avoid circular dependency with email.ts
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "hello@madhattercomedy.com";
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || "Mad Hatter <notifications@madhattercomedy.com>";
  const percentage = Math.round((currentCount / maxCount) * 100);

  const subject = period === "daily"
    ? `[Alert] Unusual traffic: ${currentCount.toLocaleString()} requests today`
    : `[Alert] Rate limit usage at ${percentage}% of free tier (${currentCount.toLocaleString()}/${maxCount.toLocaleString()})`;

  const body = period === "daily"
    ? `The MadHatter website received ${currentCount.toLocaleString()} API requests today, which exceeds the normal threshold of ${DAILY_ALERT_THRESHOLD.toLocaleString()}.\n\nThis could indicate:\n- A traffic spike from a popular event\n- A bot or scraping attempt\n- A potential attack\n\nCheck the admin dashboard rate limit meter for real-time data.\nCheck Upstash console: https://console.upstash.com`
    : `Monthly Upstash Redis usage is at ${percentage}% (${currentCount.toLocaleString()} of ${maxCount.toLocaleString()} free tier commands).\n\nIf usage exceeds 500,000 commands, rate limiting will gracefully fall back to in-memory mode. The site will continue to function normally.\n\nCheck the admin dashboard rate limit meter for real-time data.\nCheck Upstash console: https://console.upstash.com`;

  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject,
    text: body,
  }).catch(() => {});
}

/**
 * Get current usage stats for the admin dashboard.
 */
export async function getUsageStats(): Promise<{
  dailyCount: number;
  monthlyCount: number;
  monthlyLimit: number;
  daysRemaining: number;
  isRedisConnected: boolean;
  isFallbackMode: boolean;
}> {
  const r = getRedis();
  if (!r) {
    return {
      dailyCount: 0,
      monthlyCount: 0,
      monthlyLimit: FREE_TIER_LIMIT,
      daysRemaining: 0,
      isRedisConnected: false,
      isFallbackMode: true,
    };
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const monthKey = today.slice(0, 7);

    const [dailyCount, monthlyCount] = await Promise.all([
      r.get<number>(`ratelimit:usage:${today}`),
      r.get<number>(`ratelimit:usage:month:${monthKey}`),
    ]);

    // Calculate days remaining in the month
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = lastDay.getDate() - now.getDate();

    return {
      dailyCount: dailyCount || 0,
      monthlyCount: monthlyCount || 0,
      monthlyLimit: FREE_TIER_LIMIT,
      daysRemaining,
      isRedisConnected: true,
      isFallbackMode: false,
    };
  } catch {
    return {
      dailyCount: 0,
      monthlyCount: 0,
      monthlyLimit: FREE_TIER_LIMIT,
      daysRemaining: 0,
      isRedisConnected: false,
      isFallbackMode: !redisAvailable,
    };
  }
}

/**
 * Build rate limit headers for the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  if (result.reset > 0) {
    headers["X-RateLimit-Reset"] = String(result.reset);
    const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
    headers["Retry-After"] = String(retryAfter);
  }
  return headers;
}
