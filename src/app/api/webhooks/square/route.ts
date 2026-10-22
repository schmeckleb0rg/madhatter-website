import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { createHmac, timingSafeEqual } from "crypto";
import { sendTicketConfirmation, sendGiftCardEmail } from "@/lib/email";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000; // 5 minutes — reject stale webhooks (replay protection)

function verifySquareWebhook(body: string, signature: string): boolean {
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!webhookSignatureKey) return false;

  const notificationUrl = process.env.SQUARE_WEBHOOK_URL;
  if (!notificationUrl) return false;

  const hmac = createHmac("sha256", webhookSignatureKey);
  hmac.update(notificationUrl + body);
  const expectedSignature = hmac.digest("base64");

  // Timing-safe comparison using Node.js built-in (prevents timing attacks)
  const sig = Buffer.from(signature, "utf-8");
  const expected = Buffer.from(expectedSignature, "utf-8");
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(sig, expected);
}

export async function POST(request: Request) {
  // Validate Content-Type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

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

  // Replay protection — reject events older than 5 minutes
  if (event.created_at) {
    const eventAge = Date.now() - new Date(event.created_at).getTime();
    if (eventAge > MAX_WEBHOOK_AGE_MS) {
      return NextResponse.json({ received: true, skipped: "stale_event" });
    }
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
      .select("id, status, event_id, merch_item_id, order_type, quantity, email, name, amount_cents, member_id")
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

    // Send ticket confirmation email
    if (existingOrder.order_type === "ticket" && existingOrder.event_id) {
      const { data: eventData } = await db
        .from("events")
        .select("title, date, show_time, doors_time")
        .eq("id", existingOrder.event_id)
        .single();

      if (eventData) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        sendTicketConfirmation({
          email: existingOrder.email,
          eventTitle: eventData.title,
          eventDate: eventData.date,
          showTime: eventData.show_time,
          doorsTime: eventData.doors_time,
          quantity: existingOrder.quantity,
          totalAmount: `$${(existingOrder.amount_cents / 100).toFixed(2)}`,
          orderId: existingOrder.id,
          qrData: `${siteUrl}/tickets/verify?order=${existingOrder.id}`,
        });
      }
    }

    // Credit loyalty points to member
    if (existingOrder.member_id) {
      const pointsEarned = Math.floor(existingOrder.amount_cents / 100); // 1 point per dollar
      if (pointsEarned > 0) {
        await db.from("points_transactions").insert({
          member_id: existingOrder.member_id,
          points: pointsEarned,
          type: "earned",
          description: `Purchase: ${existingOrder.order_type === "ticket" ? "Tickets" : "Merch"} (Order #${existingOrder.id.slice(0, 8)})`,
          order_id: existingOrder.id,
        });
        // Update member points balance
        const { data: member } = await db
          .from("members")
          .select("points_balance")
          .eq("id", existingOrder.member_id)
          .single();
        if (member) {
          await db
            .from("members")
            .update({ points_balance: (member.points_balance || 0) + pointsEarned })
            .eq("id", existingOrder.member_id);
        }
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

  // Handle gift card purchases: activate the card and send email
  if (event.type === "payment.completed") {
    const payment = event.data?.object?.payment;
    const gcOrderId = payment?.order_id;
    if (gcOrderId) {
      const { data: giftCard } = await db
        .from("gift_cards")
        .select("*")
        .eq("square_order_id", gcOrderId)
        .eq("is_active", false)
        .single();

      if (giftCard) {
        await db
          .from("gift_cards")
          .update({ is_active: true })
          .eq("id", giftCard.id);

        // Record purchase transaction
        await db.from("gift_card_transactions").insert({
          gift_card_id: giftCard.id,
          amount_cents: giftCard.original_amount_cents,
          type: "purchase",
        });

        // Send email to recipient
        if (giftCard.recipient_email) {
          sendGiftCardEmail({
            recipientEmail: giftCard.recipient_email,
            recipientName: giftCard.recipient_name,
            senderName: giftCard.issued_by_name,
            amount: `$${(giftCard.original_amount_cents / 100).toFixed(2)}`,
            code: giftCard.code,
            message: giftCard.message,
            expiresAt: giftCard.expires_at,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
