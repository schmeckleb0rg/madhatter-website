import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  code: z.string().min(1).max(50),
  amount_cents: z.number().int().min(1),
  order_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 }
    );
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

  const { code, amount_cents, order_id } = parsed.data;
  const db = getAdminClient();

  const { data: card, error: cardError } = await db
    .from("gift_cards")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  if (!card.is_active) {
    return NextResponse.json({ error: "This gift card is not active" }, { status: 400 });
  }

  if (card.is_voided) {
    return NextResponse.json({ error: "This gift card has been voided" }, { status: 400 });
  }

  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    return NextResponse.json({ error: "This gift card has expired" }, { status: 400 });
  }

  if (card.balance_cents < amount_cents) {
    return NextResponse.json(
      { error: `Insufficient balance. Available: $${(card.balance_cents / 100).toFixed(2)}` },
      { status: 400 }
    );
  }

  // Deduct balance
  const newBalance = card.balance_cents - amount_cents;
  const newRedeemed = (card.redeemed_amount_cents ?? 0) + amount_cents;

  await db
    .from("gift_cards")
    .update({
      balance_cents: newBalance,
      redeemed_amount_cents: newRedeemed,
    })
    .eq("id", card.id);

  // Record transaction
  await db.from("gift_card_transactions").insert({
    gift_card_id: card.id,
    amount_cents,
    order_id: order_id || null,
    type: "redemption",
  });

  return NextResponse.json({
    success: true,
    remaining_balance_cents: newBalance,
  });
}
