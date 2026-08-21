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

  // Rate limit public API routes at the edge
  if (pathname.startsWith("/api/contact") || pathname.startsWith("/api/inquiries") || pathname.startsWith("/api/checkout")) {
    const allowed = edgeRateLimit(ip, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
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
  matcher: ["/admin/:path*", "/api/contact", "/api/inquiries", "/api/checkout"],
};
