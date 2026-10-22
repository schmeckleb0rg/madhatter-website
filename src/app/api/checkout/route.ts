import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { getSquareClient, getSquareLocationId } from "@/lib/square";
import { sanitizeText, rateLimit, getClientIp } from "@/lib/security";
import { getMemberSession } from "@/lib/member-auth";
import { randomUUID } from "crypto";

const schema = z.object({
  event_id: z.string().uuid().optional(),
  merch_item_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(10),
  email: z.string().email().max(200),
  name: z.string().max(100).optional(),
  order_type: z.enum(["ticket", "merch"]).default("ticket"),
  table_preference: z.string().max(200).optional(),
  gift_card_code: z.string().max(50).optional(),
});

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

  const { event_id, merch_item_id, quantity, email, name, order_type, table_preference, gift_card_code } = parsed.data;
  const db = getAdminClient();

  let itemName: string;
  let itemDescription: string;
  let unitAmountCents: number;
  let giftCardAmountCents = 0;
  let validatedGiftCard: { id: string; code: string; balance_cents: number; redeemed_amount_cents: number } | null = null;

  if (order_type === "ticket") {
    if (!event_id) {
      return NextResponse.json({ error: "event_id required for ticket orders" }, { status: 400 });
    }

    const { data: event, error: eventError } = await db
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.is_cancelled) {
      return NextResponse.json({ error: "This event has been cancelled" }, { status: 400 });
    }

    if (!event.ticket_price_cents || !event.ticket_capacity) {
      return NextResponse.json({ error: "This event does not support online ticket sales" }, { status: 400 });
    }

    if (event.is_sold_out) {
      return NextResponse.json({ error: "This event is sold out" }, { status: 400 });
    }

    const remaining = event.ticket_capacity - (event.tickets_sold ?? 0);
    if (quantity > remaining) {
      return NextResponse.json(
        { error: `Only ${remaining} ticket${remaining === 1 ? "" : "s"} remaining` },
        { status: 400 }
      );
    }

    itemName = event.title;
    itemDescription = event.performer
      ? `${event.performer} — ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
      : new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    unitAmountCents = event.ticket_price_cents;
  } else {
    if (!merch_item_id) {
      return NextResponse.json({ error: "merch_item_id required for merch orders" }, { status: 400 });
    }

    const { data: item, error: itemError } = await db
      .from("merch_items")
      .select("*")
      .eq("id", merch_item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (!item.is_active) {
      return NextResponse.json({ error: "This item is no longer available" }, { status: 400 });
    }

    if (item.inventory_count !== null && item.inventory_count < quantity) {
      return NextResponse.json({ error: "Not enough inventory" }, { status: 400 });
    }

    itemName = item.name;
    itemDescription = item.description || "Mad Hatter Merch";
    unitAmountCents = item.price_cents;
  }

  let totalAmountCents = unitAmountCents * quantity;

  // Check for member discount
  let memberId: string | null = null;
  let memberDiscount = 0;
  try {
    const member = await getMemberSession();
    if (member) {
      memberId = member.memberId;
      const { data: memberData } = await db
        .from("members")
        .select("tier")
        .eq("id", member.memberId)
        .single();

      if (memberData) {
        if (memberData.tier === "top_hat") {
          memberDiscount = 0.20; // 20% off
        } else if (memberData.tier === "mad_member") {
          memberDiscount = 0.10; // 10% off
        }
      }

      if (memberDiscount > 0) {
        totalAmountCents = Math.round(totalAmountCents * (1 - memberDiscount));
      }
    }
  } catch {
    // No member session — continue without discount
  }

  // Validate gift card if provided
  if (gift_card_code) {
    const { data: card } = await db
      .from("gift_cards")
      .select("id, code, balance_cents, redeemed_amount_cents, is_active, is_voided, expires_at")
      .eq("code", gift_card_code.toUpperCase().trim())
      .single();

    if (!card) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 400 });
    }
    if (!card.is_active || card.is_voided) {
      return NextResponse.json({ error: "This gift card is not valid" }, { status: 400 });
    }
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return NextResponse.json({ error: "This gift card has expired" }, { status: 400 });
    }
    if (card.balance_cents <= 0) {
      return NextResponse.json({ error: "This gift card has no remaining balance" }, { status: 400 });
    }

    validatedGiftCard = { id: card.id, code: card.code, balance_cents: card.balance_cents, redeemed_amount_cents: card.redeemed_amount_cents ?? 0 };
    giftCardAmountCents = Math.min(card.balance_cents, totalAmountCents);
  }

  const chargeAmountCents = totalAmountCents - giftCardAmountCents;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const idempotencyKey = randomUUID();

  // If gift card covers the full amount, skip Square checkout
  if (chargeAmountCents <= 0 && validatedGiftCard) {
    // Deduct from gift card
    const newBalance = validatedGiftCard.balance_cents - giftCardAmountCents;
    await db
      .from("gift_cards")
      .update({
        balance_cents: newBalance,
        redeemed_amount_cents: validatedGiftCard.redeemed_amount_cents + giftCardAmountCents,
      })
      .eq("id", validatedGiftCard.id);

    // Create completed order
    const { data: order } = await db.from("orders").insert({
      event_id: event_id || null,
      merch_item_id: merch_item_id || null,
      order_type,
      email: sanitizeText(email),
      name: name ? sanitizeText(name) : null,
      quantity,
      amount_cents: totalAmountCents,
      currency: "usd",
      status: "completed",
      table_preference: table_preference ? sanitizeText(table_preference) : null,
      gift_card_code: validatedGiftCard.code,
      gift_card_amount_cents: giftCardAmountCents,
      member_id: memberId,
    }).select("id").single();

    // Record gift card transaction
    await db.from("gift_card_transactions").insert({
      gift_card_id: validatedGiftCard.id,
      amount_cents: giftCardAmountCents,
      order_id: order?.id || null,
      type: "redemption",
    });

    // Update ticket count if ticket order
    if (order_type === "ticket" && event_id) {
      const { data: currentEvent } = await db
        .from("events")
        .select("tickets_sold, ticket_capacity")
        .eq("id", event_id)
        .single();
      if (currentEvent) {
        const newSold = (currentEvent.tickets_sold ?? 0) + quantity;
        const updates: Record<string, unknown> = { tickets_sold: newSold };
        if (currentEvent.ticket_capacity && newSold >= currentEvent.ticket_capacity) {
          updates.is_sold_out = true;
        }
        await db.from("events").update(updates).eq("id", event_id);
      }
    }

    return NextResponse.json({ url: `${siteUrl}/tickets/confirmation?order=${order?.id}` });
  }

  try {
    const square = getSquareClient();
    const locationId = getSquareLocationId();

    const response = await square.checkout.paymentLinks.create({
      idempotencyKey,
      order: {
        locationId,
        lineItems: [
          {
            name: itemName,
            quantity: String(quantity),
            note: itemDescription,
            basePriceMoney: {
              amount: BigInt(chargeAmountCents > 0 ? Math.ceil(chargeAmountCents / quantity) : unitAmountCents),
              currency: "USD",
            },
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/tickets/confirmation`,
        askForShippingAddress: order_type === "merch",
      },
      prePopulatedData: {
        buyerEmail: email,
      },
    });

    const paymentLink = response.paymentLink;
    if (!paymentLink?.url || !paymentLink.orderId) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    // Deduct gift card now (will be completed when payment goes through)
    if (validatedGiftCard && giftCardAmountCents > 0) {
      const newBalance = validatedGiftCard.balance_cents - giftCardAmountCents;
      await db
        .from("gift_cards")
        .update({
          balance_cents: newBalance,
          redeemed_amount_cents: validatedGiftCard.redeemed_amount_cents + giftCardAmountCents,
        })
        .eq("id", validatedGiftCard.id);

      await db.from("gift_card_transactions").insert({
        gift_card_id: validatedGiftCard.id,
        amount_cents: giftCardAmountCents,
        type: "redemption",
      });
    }

    // Create pending order
    await db.from("orders").insert({
      event_id: event_id || null,
      merch_item_id: merch_item_id || null,
      order_type,
      email: sanitizeText(email),
      name: name ? sanitizeText(name) : null,
      quantity,
      amount_cents: totalAmountCents,
      currency: "usd",
      square_order_id: paymentLink.orderId,
      status: "pending",
      table_preference: table_preference ? sanitizeText(table_preference) : null,
      gift_card_code: validatedGiftCard?.code || null,
      gift_card_amount_cents: giftCardAmountCents,
      member_id: memberId,
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (err) {
    console.error("Square checkout error:", err);
    return NextResponse.json({ error: "Payment service error" }, { status: 500 });
  }
}
