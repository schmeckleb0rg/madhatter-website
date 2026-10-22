import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  event_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  party_size: z.number().int().min(1).max(20).default(1),
  message: z.string().max(1000).optional().nullable(),
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

  const d = parsed.data;
  const db = getAdminClient();

  // Verify event exists and is an RSVP event
  const { data: event } = await db
    .from("events")
    .select("id, title, is_rsvp")
    .eq("id", d.event_id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Create an order record with $0 amount for RSVP tracking
  const { data: order, error } = await db.from("orders").insert({
    event_id: d.event_id,
    order_type: "ticket",
    email: d.email.toLowerCase().trim(),
    name: d.name.trim(),
    quantity: d.party_size,
    amount_cents: 0,
    currency: "USD",
    status: "completed",
  }).select().single();

  if (error) {
    console.error("Failed to create RSVP order:", error);
    return NextResponse.json({ error: "Failed to process RSVP" }, { status: 500 });
  }

  return NextResponse.json({ success: true, order_id: order.id }, { status: 201 });
}
