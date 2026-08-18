import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const db = getAdminClient();

    // Update order status
    const { data: order } = await db
      .from("orders")
      .update({
        status: "completed",
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session.id)
      .select()
      .single();

    if (order) {
      // Increment tickets_sold on the event
      const { data: currentEvent } = await db
        .from("events")
        .select("tickets_sold, ticket_capacity")
        .eq("id", order.event_id)
        .single();

      if (currentEvent) {
        const newSold = (currentEvent.tickets_sold ?? 0) + order.quantity;
        const updates: Record<string, unknown> = { tickets_sold: newSold };

        // Auto-mark sold out if capacity reached
        if (currentEvent.ticket_capacity && newSold >= currentEvent.ticket_capacity) {
          updates.is_sold_out = true;
        }

        await db.from("events").update(updates).eq("id", order.event_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
