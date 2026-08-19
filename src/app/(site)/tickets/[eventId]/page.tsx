import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import TicketPurchaseForm from "@/components/TicketPurchaseForm";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single();
  return {
    title: event ? `Buy Tickets — ${event.title} | Mad Hatter Comedy Club` : "Buy Tickets | Mad Hatter Comedy Club",
  };
}

export default async function TicketPurchasePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();

  if (!event || !event.ticket_price_cents || !event.ticket_capacity) {
    notFound();
  }

  const remaining = event.ticket_capacity - (event.tickets_sold ?? 0);
  const priceDisplay = `$${(event.ticket_price_cents / 100).toFixed(2)}`;
  const dateDisplay = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            Buy Tickets
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal">
            {event.title}
          </h1>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {/* Event details */}
        <div className="bg-white border border-charcoal/10 p-6 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Date</span>
              <span className="text-charcoal font-mono">{dateDisplay}</span>
            </div>
            {event.performer && (
              <div className="flex justify-between">
                <span className="text-muted">Performer</span>
                <span className="text-charcoal">{event.performer}</span>
              </div>
            )}
            {event.show_time && (
              <div className="flex justify-between">
                <span className="text-muted">Show Time</span>
                <span className="text-charcoal font-mono">{event.show_time}</span>
              </div>
            )}
            {event.doors_time && (
              <div className="flex justify-between">
                <span className="text-muted">Doors</span>
                <span className="text-charcoal font-mono">{event.doors_time}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Price</span>
              <span className="text-charcoal font-semibold">{priceDisplay} per ticket</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Availability</span>
              {event.is_sold_out ? (
                <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#9C4A38", backgroundColor: "rgba(156,74,56,0.10)" }}>Sold out</span>
              ) : remaining <= 10 ? (
                <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#96793A", backgroundColor: "rgba(150,121,58,0.12)" }}>
                  {remaining} ticket{remaining === 1 ? "" : "s"} left
                </span>
              ) : (
                <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#2F6E52", backgroundColor: "rgba(47,110,82,0.10)" }}>
                  {remaining} ticket{remaining === 1 ? "" : "s"} left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Purchase form or sold out message */}
        {event.is_sold_out || remaining <= 0 ? (
          <div className="bg-white border border-charcoal/10 p-8 text-center">
            <p className="font-display text-charcoal font-semibold text-lg">This show is sold out</p>
            <p className="text-muted text-sm mt-2">Check our other upcoming events for availability.</p>
          </div>
        ) : (
          <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
            <TicketPurchaseForm
              eventId={event.id}
              priceCents={event.ticket_price_cents}
              remaining={remaining}
            />
          </div>
        )}
      </div>
    </div>
  );
}
