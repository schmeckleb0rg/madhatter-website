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
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-club-red text-xs font-bold tracking-widest uppercase mb-3">
            Buy Tickets
          </p>
          <h1
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {event.title}
          </h1>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        {/* Event details */}
        <div className="bg-club-card border border-club-border rounded-lg p-6 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-white">{dateDisplay}</span>
            </div>
            {event.performer && (
              <div className="flex justify-between">
                <span className="text-gray-500">Performer</span>
                <span className="text-white">{event.performer}</span>
              </div>
            )}
            {event.show_time && (
              <div className="flex justify-between">
                <span className="text-gray-500">Show Time</span>
                <span className="text-white">{event.show_time}</span>
              </div>
            )}
            {event.doors_time && (
              <div className="flex justify-between">
                <span className="text-gray-500">Doors</span>
                <span className="text-white">{event.doors_time}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Price</span>
              <span className="text-white font-semibold">{priceDisplay} per ticket</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Availability</span>
              <span className={`font-semibold ${remaining <= 10 ? "text-club-red" : "text-green-400"}`}>
                {event.is_sold_out ? "Sold Out" : `${remaining} ticket${remaining === 1 ? "" : "s"} left`}
              </span>
            </div>
          </div>
        </div>

        {/* Purchase form or sold out message */}
        {event.is_sold_out || remaining <= 0 ? (
          <div className="bg-club-card border border-club-border rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-white font-semibold text-lg">This show is sold out</p>
            <p className="text-gray-500 text-sm mt-2">Check our other upcoming events for availability.</p>
          </div>
        ) : (
          <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
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
