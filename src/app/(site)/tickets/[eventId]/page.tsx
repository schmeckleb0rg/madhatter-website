import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

  const tablePreferences: string[] = Array.isArray(event.table_preferences) ? event.table_preferences : [];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Event Details
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            Buy Tickets
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal dark:text-[#F0ECE3]">
            {event.title}
          </h1>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {/* Event image */}
        {event.image_url && (
          <div className="relative aspect-video w-full bg-off-white-2 dark:bg-[#161412] overflow-hidden mb-6">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 540px"
            />
          </div>
        )}

        {/* Event details */}
        <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted dark:text-[#7A7264]">Date</span>
              <span className="text-charcoal dark:text-[#F0ECE3] font-mono">{dateDisplay}</span>
            </div>
            {event.performer && (
              <div className="flex justify-between">
                <span className="text-muted dark:text-[#7A7264]">Performer</span>
                <span className="text-charcoal dark:text-[#F0ECE3]">{event.performer}</span>
              </div>
            )}
            {event.show_time && (
              <div className="flex justify-between">
                <span className="text-muted dark:text-[#7A7264]">Show Time</span>
                <span className="text-charcoal dark:text-[#F0ECE3] font-mono">{event.show_time}</span>
              </div>
            )}
            {event.doors_time && (
              <div className="flex justify-between">
                <span className="text-muted dark:text-[#7A7264]">Doors</span>
                <span className="text-charcoal dark:text-[#F0ECE3] font-mono">{event.doors_time}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted dark:text-[#7A7264]">Price</span>
              <span className="text-charcoal dark:text-[#F0ECE3] font-semibold">{priceDisplay} per ticket</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted dark:text-[#7A7264]">Availability</span>
              {event.is_sold_out ? (
                <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#9C4A38", backgroundColor: "rgba(156,74,56,0.10)" }}>Sold out</span>
              ) : (
                <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#2F6E52", backgroundColor: "rgba(47,110,82,0.10)" }}>
                  Available
                </span>
              )}
            </div>
          </div>

          {/* Lineup */}
          {event.lineup && event.lineup.length > 0 && (
            <div className="mt-4 pt-4 border-t border-charcoal/10 dark:border-gold/10">
              <p className="font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide mb-2">Lineup</p>
              <div className="space-y-1">
                {event.lineup.map((item: { name: string; role?: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-charcoal dark:text-[#F0ECE3]">{item.name}</span>
                    {item.role && <span className="font-mono text-xs text-muted dark:text-[#7A7264]">{item.role}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Purchase form or sold out message */}
        {event.is_sold_out || remaining <= 0 ? (
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-8 text-center">
            <p className="font-display text-charcoal dark:text-[#F0ECE3] font-semibold text-lg">This show is sold out</p>
            <p className="text-muted dark:text-[#7A7264] text-sm mt-2">Check our other upcoming events for availability.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8">
            <TicketPurchaseForm
              eventId={event.id}
              priceCents={event.ticket_price_cents}
              remaining={remaining}
              tablePreferences={tablePreferences}
            />
          </div>
        )}

        {/* Image upload hint for admin */}
        <p className="text-xs text-muted dark:text-[#7A7264] text-center mt-4">
          Mad Hatter Comedy Club &bull; 21+ show &bull; Full bar available
        </p>
      </div>
    </div>
  );
}
