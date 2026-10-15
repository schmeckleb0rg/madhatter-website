import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  code: z.string().min(1).max(50),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const db = getAdminClient();
  const { data: card } = await db
    .from("gift_cards")
    .select("code, balance_cents, original_amount_cents, expires_at, is_active, is_voided")
    .eq("code", parsed.data.code.toUpperCase().trim())
    .single();

  if (!card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  if (card.is_voided) {
    return NextResponse.json({ error: "This gift card has been voided" }, { status: 400 });
  }

  if (!card.is_active) {
    return NextResponse.json({ error: "This gift card is not yet active" }, { status: 400 });
  }

  const expired = card.expires_at && new Date(card.expires_at) < new Date();

  return NextResponse.json({
    balance_cents: card.balance_cents,
    original_amount_cents: card.original_amount_cents,
    expired: !!expired,
    expires_at: card.expires_at,
  });
}
