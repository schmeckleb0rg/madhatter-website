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

// Sanitize text input — strip HTML tags
export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Get client IP from request headers
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
