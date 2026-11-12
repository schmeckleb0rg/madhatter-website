import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

// Convert UTC timestamp to Eastern Time date string (YYYY-MM-DD)
// The venue is in Eastern Time — all daily groupings use this timezone
function toEasternDate(utcTimestamp: string): string {
  return new Date(utcTimestamp).toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2");
}

export async function GET(request: Request) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // ISO timestamp
  const to = searchParams.get("to"); // ISO timestamp

  const db = getAdminClient();

  // Build base queries with optional date filters
  let ticketQuery = db
    .from("orders")
    .select("event_id, quantity, amount_cents, created_at, name, email, table_preference, member_id, events(title, date, ticket_capacity)")
    .eq("order_type", "ticket")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  let merchQuery = db
    .from("orders")
    .select("merch_item_id, quantity, amount_cents, created_at, merch_items(name)")
    .eq("order_type", "merch")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  // Gift card query — also filtered by date range for consistency
  let giftCardQuery = db
    .from("gift_cards")
    .select("original_amount_cents, redeemed_amount_cents, balance_cents, is_voided, is_active, created_at");

  if (from) {
    ticketQuery = ticketQuery.gte("created_at", from);
    merchQuery = merchQuery.gte("created_at", from);
    giftCardQuery = giftCardQuery.gte("created_at", from);
  }
  if (to) {
    // Ensure the 'to' date includes the full day
    const toDate = to.includes("T") ? to : `${to}T23:59:59.999Z`;
    ticketQuery = ticketQuery.lte("created_at", toDate);
    merchQuery = merchQuery.lte("created_at", toDate);
    giftCardQuery = giftCardQuery.lte("created_at", toDate);
  }

  const [
    { data: ticketOrders, error: ticketErr },
    { data: merchOrders, error: merchErr },
    { data: giftCards, error: gcErr },
  ] = await Promise.all([ticketQuery, merchQuery, giftCardQuery]);

  // Surface errors instead of silently returning zeros
  if (ticketErr || merchErr || gcErr) {
    const msg = ticketErr?.message || merchErr?.message || gcErr?.message || "Database query failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const tickets = ticketOrders ?? [];
  const merch = merchOrders ?? [];
  const cards = giftCards ?? [];

  // Overview — totalRevenueCents is ticket + merch (cash collected)
  // Gift cards are tracked separately as issued liability, not revenue
  const ticketRevenueCents = tickets.reduce((s, o) => s + o.amount_cents, 0);
  const merchRevenueCents = merch.reduce((s, o) => s + o.amount_cents, 0);
  const totalRevenueCents = ticketRevenueCents + merchRevenueCents;
  const totalOrders = tickets.length + merch.length;
  const totalTicketsSold = tickets.reduce((s, o) => s + o.quantity, 0);
  const avgOrderCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  // Tickets by event
  type GuestEntry = {
    name: string | null;
    email: string;
    quantity: number;
    amount_cents: number;
    created_at: string;
    table_preference: string | null;
    is_member: boolean;
  };
  const eventMap = new Map<
    string,
    { eventId: string; title: string; date: string; ticketsSold: number; revenueCents: number; capacity: number | null; guestList: GuestEntry[] }
  >();
  for (const order of tickets) {
    const eid = order.event_id ?? "unknown";
    const existing = eventMap.get(eid);
    const guest: GuestEntry = {
      name: order.name as string | null,
      email: order.email as string,
      quantity: order.quantity as number,
      amount_cents: order.amount_cents as number,
      created_at: order.created_at as string,
      table_preference: order.table_preference as string | null,
      is_member: !!(order.member_id),
    };
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

  // Gift card summary — only count activated (is_active) and non-voided cards
  const activeCards = cards.filter((c) => !c.is_voided && c.is_active);
  const voidedCount = cards.filter((c) => c.is_voided).length;
  const pendingCount = cards.filter((c) => !c.is_active && !c.is_voided).length;
  const giftCardSummary = {
    totalIssuedCents: activeCards.reduce((s, c) => s + c.original_amount_cents, 0),
    totalRedeemedCents: activeCards.reduce((s, c) => s + c.redeemed_amount_cents, 0),
    outstandingCents: activeCards.reduce((s, c) => s + c.balance_cents, 0),
    activeCount: activeCards.length,
    voidedCount,
    pendingCount,
  };

  // Revenue by day — grouped by Eastern Time date
  const dayMap = new Map<string, { ticketCents: number; merchCents: number }>();
  for (const order of tickets) {
    const day = toEasternDate(order.created_at);
    const existing = dayMap.get(day);
    if (existing) existing.ticketCents += order.amount_cents;
    else dayMap.set(day, { ticketCents: order.amount_cents, merchCents: 0 });
  }
  for (const order of merch) {
    const day = toEasternDate(order.created_at);
    const existing = dayMap.get(day);
    if (existing) existing.merchCents += order.amount_cents;
    else dayMap.set(day, { ticketCents: 0, merchCents: order.amount_cents });
  }
  const revenueByDay = Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date)); // chronological for trend reading

  return NextResponse.json({
    overview: {
      totalRevenueCents,
      ticketRevenueCents,
      merchRevenueCents,
      totalOrders,
      totalTicketsSold,
      avgOrderCents,
    },
    ticketsByEvent,
    merchByItem,
    giftCards: giftCardSummary,
    revenueByDay,
  });
}
