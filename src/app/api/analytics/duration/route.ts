import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/security";
import { createHash } from "crypto";

const schema = z.object({
  path: z.string().min(1).max(500),
  durationMs: z.number().int().min(500).max(1_800_000),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, 30, 60_000);
  if (!allowed) return NextResponse.json({ ok: true });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  const { path, durationMs } = parsed.data;

  const ua = request.headers.get("user-agent") || "";
  const dateStr = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash("sha256")
    .update(`${ip}|${ua}|${dateStr}`)
    .digest("hex")
    .slice(0, 16);

  try {
    const db = getAdminClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: rows } = await db
      .from("pageviews")
      .select("id")
      .eq("visitor_hash", visitorHash)
      .eq("path", path)
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (rows && rows.length > 0) {
      await db
        .from("pageviews")
        .update({ duration_ms: durationMs })
        .eq("id", rows[0].id);
    }
  } catch {
    // Silent fail
  }

  return NextResponse.json({ ok: true });
}
