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

  try {
    // Fetch event basic info
    const { data: event, error: eventError } = await db
      .from("events")
      .select("id, ticket_capacity, tickets_sold, is_rsvp")
      .eq("id", id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: `Event not found: ${eventError?.message ?? "no matching row"}` }, { status: 404 });
    }

    // Fetch all ticket orders for this event
    const { data: orders, error: ordersError } = await db
      .from("orders")
      .select("name, email, quantity, amount_cents, status, created_at")
      .eq("event_id", id)
      .eq("order_type", "ticket")
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: `Failed to fetch orders: ${ordersError.message}` }, { status: 500 });
    }

    // Fetch inquiries (full list for display + count)
    const { data: inquiryData, error: inquiryError, count: inquiryCount } = await db
      .from("ticket_inquiries")
      .select("id, name, email, phone, party_size, message, is_read, created_at", { count: "exact" })
      .eq("event_id", id)
      .order("created_at", { ascending: false });

    if (inquiryError) {
      return NextResponse.json({ error: `Failed to fetch inquiries: ${inquiryError.message}` }, { status: 500 });
    }

    const completedOrders = (orders ?? []).filter((o) => o.status === "completed");
    const totalRevenueCents = completedOrders.reduce((sum, o) => sum + (o.amount_cents ?? 0), 0);
    const attendeesCount = completedOrders.reduce((sum, o) => sum + (o.quantity ?? 0), 0);
    const rsvpCount = event.is_rsvp
      ? completedOrders.filter((o) => (o.amount_cents ?? 0) === 0).reduce((sum, o) => sum + (o.quantity ?? 0), 0)
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
        quantity: o.quantity ?? 0,
        amount_cents: o.amount_cents ?? 0,
        status: o.status,
        created_at: o.created_at,
      })),
      allOrders: (orders ?? []).map((o) => ({
        name: o.name,
        email: o.email,
        quantity: o.quantity ?? 0,
        amount_cents: o.amount_cents ?? 0,
        status: o.status,
        created_at: o.created_at,
      })),
      inquiries: (inquiryData ?? []).map((i) => ({
        name: i.name,
        email: i.email,
        phone: i.phone,
        party_size: i.party_size,
        message: i.message,
        is_read: i.is_read,
        created_at: i.created_at,
      })),
    });
  } catch (err) {
    console.error("Stats API error for event", id, err);
    return NextResponse.json({ error: `Internal error: ${err instanceof Error ? err.message : "unknown"}` }, { status: 500 });
  }
}
