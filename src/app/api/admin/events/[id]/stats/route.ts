import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();

  // Fetch event basic info
  const { data: event } = await db
    .from("events")
    .select("id, ticket_capacity, tickets_sold, is_rsvp")
    .eq("id", id)
    .single();

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch all ticket orders for this event
  const { data: orders } = await db
    .from("orders")
    .select("name, email, quantity, amount_cents, status, created_at")
    .eq("event_id", id)
    .eq("order_type", "ticket")
    .order("created_at", { ascending: false });

  // Fetch inquiry count
  const { count: inquiryCount } = await db
    .from("ticket_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  const completedOrders = (orders ?? []).filter((o) => o.status === "completed");
  const totalRevenueCents = completedOrders.reduce((sum, o) => sum + o.amount_cents, 0);
  const attendeesCount = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const rsvpCount = event.is_rsvp
    ? completedOrders.filter((o) => o.amount_cents === 0).reduce((sum, o) => sum + o.quantity, 0)
    : 0;

  return NextResponse.json({
    ticketsSold: event.tickets_sold ?? 0,
    ticketCapacity: event.ticket_capacity,
    totalRevenueCents,
    rsvpCount,
    attendeesCount,
    inquiryCount: inquiryCount ?? 0,
    guestList: completedOrders.map((o) => ({
      name: o.name,
      email: o.email,
      quantity: o.quantity,
      amount_cents: o.amount_cents,
      status: o.status,
      created_at: o.created_at,
    })),
    allOrders: (orders ?? []).map((o) => ({
      name: o.name,
      email: o.email,
      quantity: o.quantity,
      amount_cents: o.amount_cents,
      status: o.status,
      created_at: o.created_at,
    })),
  });
}
