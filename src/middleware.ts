import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible in-memory rate limiter (Layer 1 — fast rejection)
// This is supplemented by Upstash Redis in API routes (Layer 2 — accurate enforcement)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

// Edge-compatible IP hashing using Web Crypto API (not Node.js crypto)
async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function edgeRateLimit(ip: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const key = await hashIP(ip); // Privacy: don't store raw IPs

  // Clean up expired entries (check a few on each call instead of setInterval)
  if (requestCounts.size > 1000) {
    for (const [k, v] of requestCounts) {
      if (now > v.resetAt) requestCounts.delete(k);
      if (requestCounts.size <= 500) break;
    }
  }

  const entry = requestCounts.get(key);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// Route-to-tier mapping for rate limit configuration
function getRouteLimit(pathname: string): { limit: number; windowMs: number } | null {
  // Auth routes — strict
  if (pathname.startsWith("/api/membership/register") ||
      pathname.startsWith("/api/membership/login") ||
      pathname.startsWith("/api/admin/forgot-password") ||
      pathname.startsWith("/api/admin/reset-password")) {
    return { limit: 5, windowMs: 60_000 };
  }

  // Payment routes — strict
  if (pathname.startsWith("/api/checkout") ||
      pathname.startsWith("/api/gift-cards/purchase") ||
      pathname.startsWith("/api/membership/subscribe")) {
    return { limit: 3, windowMs: 60_000 };
  }

  // Form submissions — moderate
  if (pathname.startsWith("/api/contact") ||
      pathname.startsWith("/api/inquiries") ||
      pathname.startsWith("/api/private-events") ||
      pathname.startsWith("/api/event-spaces") ||
      pathname.startsWith("/api/employment/apply") ||
      pathname.startsWith("/api/classes/enroll") ||
      pathname.startsWith("/api/rsvp")) {
    return { limit: 5, windowMs: 60_000 };
  }

  // Newsletter/subscribe
  if (pathname.startsWith("/api/subscribe")) {
    return { limit: 3, windowMs: 60_000 };
  }

  // Analytics — generous (every page load triggers one)
  if (pathname.startsWith("/api/analytics")) {
    return { limit: 30, windowMs: 60_000 };
  }

  // Read-only lookups — generous
  if (pathname.startsWith("/api/gift-cards/lookup") ||
      pathname.startsWith("/api/gift-cards/redeem") ||
      pathname.startsWith("/api/membership/me") ||
      pathname.startsWith("/api/membership/logout") ||
      pathname.startsWith("/api/calendar")) {
    return { limit: 15, windowMs: 60_000 };
  }

  // Admin API routes — generous but bounded
  if (pathname.startsWith("/api/admin")) {
    return { limit: 30, windowMs: 60_000 };
  }

  // Webhooks — no rate limiting (they have signature verification)
  if (pathname.startsWith("/api/webhooks")) {
    return null;
  }

  // Default for any other API route
  if (pathname.startsWith("/api/")) {
    return { limit: 10, windowMs: 60_000 };
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // --- Rate limiting for API routes (Layer 1) ---
  const routeLimit = getRouteLimit(pathname);
  if (routeLimit) {
    const { allowed, remaining } = await edgeRateLimit(ip, routeLimit.limit, routeLimit.windowMs);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(routeLimit.windowMs / 1000)),
            "X-RateLimit-Limit": String(routeLimit.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Attach remaining count as header for downstream use
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    // For API routes that don't need admin auth, return early
    if (pathname.startsWith("/api/") && !pathname.startsWith("/admin")) {
      return response;
    }
  }

  // --- Admin route protection ---
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/forgot-password" &&
    pathname !== "/admin/reset-password"
  ) {
    const session = await auth();

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      // Validate callback URL to prevent open redirect
      const isSafeCallback = pathname.startsWith("/admin") && !pathname.includes("//") && !pathname.includes(":");
      loginUrl.searchParams.set("callbackUrl", isSafeCallback ? pathname : "/admin/dashboard");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin pages and API
    "/admin/:path*",
    "/api/admin/:path*",
    // Public API routes
    "/api/contact",
    "/api/inquiries",
    "/api/checkout",
    "/api/rsvp",
    "/api/subscribe",
    "/api/private-events",
    "/api/event-spaces/:path*",
    "/api/employment/:path*",
    "/api/classes/:path*",
    "/api/gift-cards/:path*",
    "/api/membership/:path*",
    "/api/calendar/:path*",
    // Analytics
    "/api/analytics/:path*",
    // Webhooks (matched for logging, not rate limited)
    "/api/webhooks/:path*",
  ],
};
