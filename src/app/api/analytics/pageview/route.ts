import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/security";
import { createHash } from "crypto";

const schema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(2000).nullable().optional(),
  screenWidth: z.number().int().min(0).max(10000).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const { path, referrer, screenWidth } = parsed.data;

  // Daily anonymous visitor hash: SHA-256(IP|UA|date), no PII stored
  const ua = request.headers.get("user-agent") || "";
  const dateStr = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash("sha256")
    .update(`${ip}|${ua}|${dateStr}`)
    .digest("hex")
    .slice(0, 16);

  // Strip same-origin referrers
  let cleanReferrer = referrer || null;
  if (cleanReferrer) {
    try {
      const refUrl = new URL(cleanReferrer);
      const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
      if (siteUrl) {
        const siteHost = new URL(siteUrl).hostname;
        if (refUrl.hostname === siteHost) cleanReferrer = null;
      }
    } catch {
      cleanReferrer = null;
    }
  }

  try {
    const db = getAdminClient();
    await db.from("pageviews").insert({
      path,
      referrer: cleanReferrer,
      screen_width: screenWidth ?? null,
      visitor_hash: visitorHash,
    });
  } catch {
    // Silent fail — analytics should never break the site
  }

  return NextResponse.json({ ok: true });
}
