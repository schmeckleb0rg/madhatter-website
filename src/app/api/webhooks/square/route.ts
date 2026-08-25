import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { createHmac } from "crypto";

function verifySquareWebhook(body: string, signature: string): boolean {
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!webhookSignatureKey) return false;

  const notificationUrl = process.env.SQUARE_WEBHOOK_URL;
  if (!notificationUrl) return false;

  const hmac = createHmac("sha256", webhookSignatureKey);
  hmac.update(notificationUrl + body);
  const expectedSignature = hmac.digest("base64");

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifySquareWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getAdminClient();

  if (event.type === "payment.completed") {
    const payment = event.data?.object?.payment;
    if (!payment) {
      return NextResponse.json({ received: true, skipped: "no_payment_data" });
    }

    const orderId = payment.order_id;
    const paymentId = payment.id;

    if (!orderId) {
      return NextResponse.json({ received: true, skipped: "no_order_id" });
    }

    // Idempotency: check if already processed
    const { data: existingOrder } = await db
      .from("orders")
      .select("id, status, event_id, merch_item_id, order_type, quantity")
      .eq("square_order_id", orderId)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ received: true, skipped: "order_not_found" });
    }

    if (existingOrder.status === "completed") {
      return NextResponse.json({ received: true, skipped: "already_processed" });
    }

    // Update order status
    await db
      .from("orders")
      .update({
        status: "completed",
        square_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("square_order_id", orderId);

    // Handle ticket orders: increment tickets_sold
    if (existingOrder.order_type === "ticket" && existingOrder.event_id) {
      const { data: currentEvent } = await db
        .from("events")
        .select("tickets_sold, ticket_capacity")
        .eq("id", existingOrder.event_id)
        .single();

      if (currentEvent) {
        const newSold = (currentEvent.tickets_sold ?? 0) + existingOrder.quantity;
        const updates: Record<string, unknown> = { tickets_sold: newSold };

        if (currentEvent.ticket_capacity && newSold >= currentEvent.ticket_capacity) {
          updates.is_sold_out = true;
        }

        await db.from("events").update(updates).eq("id", existingOrder.event_id);
      }
    }

    // Handle merch orders: decrement inventory
    if (existingOrder.order_type === "merch" && existingOrder.merch_item_id) {
      const { data: merchItem } = await db
        .from("merch_items")
        .select("inventory_count")
        .eq("id", existingOrder.merch_item_id)
        .single();

      if (merchItem && merchItem.inventory_count !== null) {
        const newCount = Math.max(0, merchItem.inventory_count - existingOrder.quantity);
        await db
          .from("merch_items")
          .update({ inventory_count: newCount })
          .eq("id", existingOrder.merch_item_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
