import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function edgeRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Rate limit membership auth routes at the edge
  if (pathname.startsWith("/api/membership/register") || pathname.startsWith("/api/membership/login")) {
    const allowed = edgeRateLimit(ip, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Rate limit public API routes at the edge
  if (pathname.startsWith("/api/contact") || pathname.startsWith("/api/inquiries") || pathname.startsWith("/api/checkout") || pathname.startsWith("/api/rsvp")) {
    const allowed = edgeRateLimit(ip, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Rate limit password reset endpoints
  if (pathname.startsWith("/api/admin/forgot-password") || pathname.startsWith("/api/admin/reset-password")) {
    const allowed = edgeRateLimit(ip, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Protect all /admin routes except login and password reset pages
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
  matcher: ["/admin/:path*", "/api/contact", "/api/inquiries", "/api/checkout", "/api/rsvp", "/api/membership/register", "/api/membership/login", "/api/admin/forgot-password", "/api/admin/reset-password"],
};
