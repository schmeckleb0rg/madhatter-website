import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  event_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  email: z.string().email().max(200),
  name: z.string().max(100).optional(),
});

export async function POST(request: Request) {
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

  const { event_id, quantity, email, name } = parsed.data;
  const db = getAdminClient();

  // Fetch event and validate availability
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Create Stripe Checkout Session
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
            description: event.performer
              ? `${event.performer} — ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
              : new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
          },
          unit_amount: event.ticket_price_cents,
        },
        quantity,
      },
    ],
    metadata: {
      event_id,
      quantity: String(quantity),
    },
    success_url: `${siteUrl}/tickets/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/events`,
  });

  // Create pending order
  await db.from("orders").insert({
    event_id,
    email: sanitizeText(email),
    name: name ? sanitizeText(name) : null,
    quantity,
    amount_cents: event.ticket_price_cents * quantity,
    currency: "usd",
    stripe_checkout_session_id: session.id,
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
