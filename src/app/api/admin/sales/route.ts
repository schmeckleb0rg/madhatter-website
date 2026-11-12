import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET(request: Request) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // ISO date string
  const to = searchParams.get("to"); // ISO date string

  const db = getAdminClient();

  // Build base queries with optional date filters
  let ticketQuery = db
    .from("orders")
    .select("event_id, quantity, amount_cents, created_at, name, email, events(title, date, ticket_capacity)")
    .eq("order_type", "ticket")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  let merchQuery = db
    .from("orders")
    .select("merch_item_id, quantity, amount_cents, created_at, merch_items(name)")
    .eq("order_type", "merch")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (from) {
    ticketQuery = ticketQuery.gte("created_at", from);
    merchQuery = merchQuery.gte("created_at", from);
  }
  if (to) {
    ticketQuery = ticketQuery.lte("created_at", to);
    merchQuery = merchQuery.lte("created_at", to);
  }

  const [
    { data: ticketOrders },
    { data: merchOrders },
    { data: giftCards },
  ] = await Promise.all([
    ticketQuery,
    merchQuery,
    db.from("gift_cards").select("original_amount_cents, redeemed_amount_cents, balance_cents, is_voided, is_active"),
  ]);

  const tickets = ticketOrders ?? [];
  const merch = merchOrders ?? [];
  const cards = giftCards ?? [];

  // Overview
  const ticketRevenueCents = tickets.reduce((s, o) => s + o.amount_cents, 0);
  const merchRevenueCents = merch.reduce((s, o) => s + o.amount_cents, 0);
  const giftCardRevenueCents = cards
    .filter((c) => !c.is_voided)
    .reduce((s, c) => s + c.original_amount_cents, 0);
  const totalRevenueCents = ticketRevenueCents + merchRevenueCents;
  const totalOrders = tickets.length + merch.length;
  const avgOrderCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  // Tickets by event
  const eventMap = new Map<
    string,
    { eventId: string; title: string; date: string; ticketsSold: number; revenueCents: number; capacity: number | null; guestList: { name: string | null; email: string; quantity: number; amount_cents: number; created_at: string }[] }
  >();
  for (const order of tickets) {
    const eid = order.event_id ?? "unknown";
    const existing = eventMap.get(eid);
    const guest = { name: order.name as string | null, email: order.email as string, quantity: order.quantity as number, amount_cents: order.amount_cents as number, created_at: order.created_at as string };
    if (existing) {
      existing.ticketsSold += order.quantity;
      existing.revenueCents += order.amount_cents;
      existing.guestList.push(guest);
    } else {
      const evRaw = order.events;
      const ev = (Array.isArray(evRaw) ? evRaw[0] : evRaw) as { title: string; date: string; ticket_capacity: number | null } | null;
      eventMap.set(eid, {
        eventId: eid,
        title: ev?.title ?? "Unknown Event",
        date: ev?.date ?? "",
        ticketsSold: order.quantity,
        revenueCents: order.amount_cents,
        capacity: ev?.ticket_capacity ?? null,
        guestList: [guest],
      });
    }
  }
  const ticketsByEvent = Array.from(eventMap.values()).sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  // Merch by item
  const merchMap = new Map<
    string,
    { itemId: string; name: string; unitsSold: number; revenueCents: number }
  >();
  for (const order of merch) {
    const mid = order.merch_item_id ?? "unknown";
    const existing = merchMap.get(mid);
    if (existing) {
      existing.unitsSold += order.quantity;
      existing.revenueCents += order.amount_cents;
    } else {
      const itemRaw = order.merch_items;
      const item = (Array.isArray(itemRaw) ? itemRaw[0] : itemRaw) as { name: string } | null;
      merchMap.set(mid, {
        itemId: mid,
        name: item?.name ?? "Unknown Item",
        unitsSold: order.quantity,
        revenueCents: order.amount_cents,
      });
    }
  }
  const merchByItem = Array.from(merchMap.values()).sort(
    (a, b) => b.revenueCents - a.revenueCents
  );

  // Gift card summary
  const activeCards = cards.filter((c) => !c.is_voided);
  const giftCardSummary = {
    totalIssuedCents: activeCards.reduce((s, c) => s + c.original_amount_cents, 0),
    totalRedeemedCents: activeCards.reduce((s, c) => s + c.redeemed_amount_cents, 0),
    outstandingCents: activeCards.reduce((s, c) => s + c.balance_cents, 0),
    cardCount: activeCards.length,
  };

  // Revenue by day
  const dayMap = new Map<string, { ticketCents: number; merchCents: number }>();
  for (const order of tickets) {
    const day = order.created_at.slice(0, 10);
    const existing = dayMap.get(day);
    if (existing) existing.ticketCents += order.amount_cents;
    else dayMap.set(day, { ticketCents: order.amount_cents, merchCents: 0 });
  }
  for (const order of merch) {
    const day = order.created_at.slice(0, 10);
    const existing = dayMap.get(day);
    if (existing) existing.merchCents += order.amount_cents;
    else dayMap.set(day, { ticketCents: 0, merchCents: order.amount_cents });
  }
  const revenueByDay = Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({
    overview: {
      totalRevenueCents,
      ticketRevenueCents,
      merchRevenueCents,
      giftCardRevenueCents,
      totalOrders,
      avgOrderCents,
    },
    ticketsByEvent,
    merchByItem,
    giftCards: giftCardSummary,
    revenueByDay,
  });
}
