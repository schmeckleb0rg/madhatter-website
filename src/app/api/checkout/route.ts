import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { getSquareClient, getSquareLocationId } from "@/lib/square";
import { sanitizeText, rateLimit, getClientIp } from "@/lib/security";
import { randomUUID } from "crypto";

const schema = z.object({
  event_id: z.string().uuid().optional(),
  merch_item_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(10),
  email: z.string().email().max(200),
  name: z.string().max(100).optional(),
  order_type: z.enum(["ticket", "merch"]).default("ticket"),
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

  const { event_id, merch_item_id, quantity, email, name, order_type } = parsed.data;
  const db = getAdminClient();

  let itemName: string;
  let itemDescription: string;
  let unitAmountCents: number;

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
            name: itemName,
            quantity: String(quantity),
            note: itemDescription,
            basePriceMoney: {
              amount: BigInt(unitAmountCents),
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

    // Create pending order
    await db.from("orders").insert({
      event_id: event_id || null,
      merch_item_id: merch_item_id || null,
      order_type,
      email: sanitizeText(email),
      name: name ? sanitizeText(name) : null,
      quantity,
      amount_cents: unitAmountCents * quantity,
      currency: "usd",
      square_order_id: paymentLink.orderId,
      status: "pending",
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (err) {
    console.error("Square checkout error:", err);
    return NextResponse.json({ error: "Payment service error" }, { status: 500 });
  }
}
