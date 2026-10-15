import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { getSquareClient, getSquareLocationId } from "@/lib/square";
import { sanitizeText, rateLimit, getClientIp } from "@/lib/security";
import { randomBytes, randomUUID } from "crypto";

const schema = z.object({
  amount_cents: z.number().int().min(1000).max(50000),
  sender_name: z.string().max(100).optional(),
  sender_email: z.string().email().max(200),
  recipient_name: z.string().max(100).optional(),
  recipient_email: z.string().email().max(200),
  message: z.string().max(500).optional(),
});

function generateGiftCardCode(): string {
  const bytes = randomBytes(6);
  const code = bytes.toString("hex").toUpperCase().slice(0, 12);
  return `MH-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, 3, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
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

  const { amount_cents, sender_name, sender_email, recipient_name, recipient_email, message } = parsed.data;
  const db = getAdminClient();

  // Get expiry setting
  const { data: expirySetting } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "gift_card_expiry_days")
    .single();
  const expiryDays = parseInt(expirySetting?.value ?? "365", 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const code = generateGiftCardCode();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const idempotencyKey = randomUUID();

  try {
    const square = getSquareClient();
    const locationId = getSquareLocationId();

    const response = await square.checkout.paymentLinks.create({
      idempotencyKey,
      order: {
        locationId,
        lineItems: [
          {
            name: "Mad Hatter Gift Card",
            quantity: "1",
            note: `Gift card for ${recipient_name || recipient_email}`,
            basePriceMoney: {
              amount: BigInt(amount_cents),
              currency: "USD",
            },
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/gift-cards?purchased=true`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: sender_email,
      },
    });

    const paymentLink = response.paymentLink;
    if (!paymentLink?.url || !paymentLink.orderId) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    // Create pending gift card
    await db.from("gift_cards").insert({
      code,
      balance_cents: amount_cents,
      original_amount_cents: amount_cents,
      redeemed_amount_cents: 0,
      issued_to_email: sanitizeText(sender_email),
      issued_by_name: sender_name ? sanitizeText(sender_name) : null,
      recipient_name: recipient_name ? sanitizeText(recipient_name) : null,
      recipient_email: sanitizeText(recipient_email),
      message: message ? sanitizeText(message) : null,
      expires_at: expiresAt.toISOString(),
      is_voided: false,
      is_active: false, // activated after payment
      square_order_id: paymentLink.orderId,
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (err) {
    console.error("Gift card purchase error:", err);
    return NextResponse.json({ error: "Payment service error" }, { status: 500 });
  }
}
