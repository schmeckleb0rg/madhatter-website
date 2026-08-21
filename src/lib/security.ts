// Simple in-memory rate limiter (resets on server restart)
// For production, use Redis-based rate limiting (e.g., @upstash/ratelimit)

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  limit = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = ip;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitMap.entries())) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

// Sanitize text input — strip HTML tags, event handlers, and dangerous protocols
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/javascript:/gi, "")       // strip javascript: protocol
    .replace(/on\w+\s*=/gi, "")         // strip event handlers (onclick=, etc.)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control characters
    .trim();
}

// Validate and sanitize URLs — only allow HTTPS from trusted hosts
export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:") return null;
    const allowedHosts = [
      /^[a-z0-9-]+\.supabase\.co$/,
      /^placehold\.co$/,
    ];
    if (!allowedHosts.some((pattern) => pattern.test(url.hostname))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// Get client IP from request headers
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
