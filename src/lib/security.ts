import { createHash } from "crypto";

// ============================================================
// In-memory rate limiter (fallback for when Upstash is unavailable)
// Primary rate limiting is handled by Upstash Redis in rate-limit.ts
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  limit = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = hashIP(ip); // Privacy: hash IPs before storing

  // Lazy cleanup: remove a batch of expired entries when map gets large
  if (rateLimitMap.size > 500) {
    for (const [k, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(k);
      if (rateLimitMap.size <= 250) break;
    }
  }

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

// ============================================================
// IP Privacy — SHA-256 hash before storage or logging
// ============================================================

export function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

// ============================================================
// Input Sanitization
// ============================================================

/**
 * Sanitize text input — strip HTML, entities, dangerous protocols, and control characters.
 * This is a secondary defense layer. Primary defenses are:
 * - Zod schema validation (structure/type)
 * - Supabase parameterized queries (SQL injection)
 * - React JSX escaping (XSS in output)
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/\0/g, "")                   // strip null bytes
    .replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, "") // strip HTML entities (&amp;, &#x3C;, etc.)
    .replace(/<[^>]*>/g, "")              // strip HTML tags
    .replace(/javascript\s*:/gi, "")      // strip javascript: protocol
    .replace(/vbscript\s*:/gi, "")        // strip vbscript: protocol
    .replace(/data\s*:[^,]*;base64/gi, "") // strip data: base64 URIs
    .replace(/on\w+\s*=/gi, "")           // strip event handlers (onclick=, etc.)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control characters
    .trim();
}

/**
 * Validate and sanitize URLs — only allow HTTPS from trusted hosts.
 */
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

// ============================================================
// Validation Helpers
// ============================================================

type ValidationResult<T> = { valid: true; data: T } | { valid: false; error: string };

/**
 * Validate email address — RFC 5322 compliant, max 254 chars.
 * Defense-in-depth alongside Zod's .email().
 */
export function validateEmail(email: string): ValidationResult<string> {
  if (email.length > 254) {
    return { valid: false, error: "Email address too long" };
  }
  // RFC 5322 simplified pattern
  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!pattern.test(email)) {
    return { valid: false, error: "Invalid email address" };
  }
  return { valid: true, data: email.toLowerCase().trim() };
}

/**
 * Validate file upload — check MIME type and size.
 */
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  video: ["video/mp4", "video/quicktime"],
};

export function validateFileUpload(
  file: { type: string; size: number },
  options: { allowedCategories?: string[]; maxSizeMB?: number } = {}
): ValidationResult<true> {
  const { allowedCategories = ["image"], maxSizeMB = 4 } = options;

  const allowedTypes = allowedCategories.flatMap((cat) => ALLOWED_FILE_TYPES[cat] || []);
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File too large. Maximum ${maxSizeMB}MB allowed.` };
  }

  return { valid: true, data: true };
}

// ============================================================
// Request Helpers
// ============================================================

/**
 * Get client IP from request headers.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
