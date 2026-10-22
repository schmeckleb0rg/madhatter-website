import "server-only";

// Server-only environment variable validation
// This module throws at import time if required vars are missing,
// so failures surface immediately on server startup.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Add it to .env.local (development) or your deployment platform (production). ` +
      `See .env.local.example for reference.`
    );
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

// --- Supabase ---
export const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

// --- Auth ---
export const NEXTAUTH_SECRET = requireEnv("NEXTAUTH_SECRET");
export const MEMBER_JWT_SECRET = new TextEncoder().encode(
  process.env.MEMBER_JWT_SECRET || NEXTAUTH_SECRET
);

// --- Stripe (optional — site runs without Stripe in test mode) ---
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// --- Square (optional — site runs without Square in test mode) ---
export const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
export const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
export const SQUARE_WEBHOOK_URL = process.env.SQUARE_WEBHOOK_URL || "";
export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";

// --- Resend (optional — emails silently skip if not configured) ---
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// --- Email addresses ---
export const NOTIFICATION_FROM_EMAIL = optionalEnv(
  "NOTIFICATION_FROM_EMAIL",
  "Mad Hatter <notifications@madhattercomedy.com>"
);
export const ADMIN_NOTIFICATION_EMAIL = optionalEnv(
  "ADMIN_NOTIFICATION_EMAIL",
  "hello@madhattercomedy.com"
);

// --- Upstash Redis (optional — rate limiting degrades to in-memory if not set) ---
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || "";
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

// --- Site ---
export const SITE_URL = optionalEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
