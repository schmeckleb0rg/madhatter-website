import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/lib/supabase";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    full: d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function getAvailabilityBadge(event: Event) {
  if (event.is_sold_out) {
    return (
      <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#9C4A38", backgroundColor: "rgba(156,74,56,0.10)" }}>
        Sold out
      </span>
    );
  }
  if (event.ticket_capacity && event.tickets_sold != null) {
    const remaining = event.ticket_capacity - event.tickets_sold;
    if (remaining <= Math.ceil(event.ticket_capacity * 0.2)) {
      return (
        <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#96793A", backgroundColor: "rgba(150,121,58,0.12)" }}>
          Low tickets
        </span>
      );
    }
  }
  if (event.ticket_capacity) {
    return (
      <span className="font-mono text-xs font-medium px-2 py-1" style={{ color: "#2F6E52", backgroundColor: "rgba(47,110,82,0.10)" }}>
        Available
      </span>
    );
  }
  return null;
}

export default function EventCard({ event }: { event: Event }) {
  const date = formatDate(event.date);

  return (
    <div className="group bg-white border border-charcoal/10 overflow-hidden hover:border-charcoal/20 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-off-white-2 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-off-white-2">
            <span className="font-display text-2xl text-muted/30">MH</span>
          </div>
        )}
        {event.is_featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-white text-xs font-mono font-medium tracking-wider uppercase">
            Featured
          </div>
        )}
        {event.is_sold_out && (
          <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
            <span className="font-mono text-off-white font-medium text-sm tracking-widest uppercase">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex gap-4">
        {/* Date block */}
        <div className="flex-shrink-0 text-center w-12">
          <div className="font-mono text-xs font-medium text-gold">{date.month}</div>
          <div className="text-2xl font-bold text-charcoal leading-none">{date.day}</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-charcoal truncate">{event.title}</h3>
          {event.performer && (
            <p className="text-sm text-muted mt-0.5">{event.performer}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
            {event.show_time && <span className="font-mono">{event.show_time}</span>}
            {event.ticket_price_cents ? (
              <span className="font-mono">${(event.ticket_price_cents / 100).toFixed(2)}</span>
            ) : (
              event.ticket_price && <span className="font-mono">{event.ticket_price}</span>
            )}
            {getAvailabilityBadge(event)}
          </div>
        </div>
      </div>

      {/* CTA */}
      {!event.is_sold_out && (
        <div className="px-5 pb-5">
          {event.ticket_price_cents && event.ticket_capacity ? (
            <Link
              href={`/tickets/${event.id}`}
              className="block w-full text-center py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-all duration-200"
            >
              Buy Tickets — ${(event.ticket_price_cents / 100).toFixed(2)}
            </Link>
          ) : (
            <Link
              href={`/tickets?event=${event.id}`}
              className="block w-full text-center py-2 border border-charcoal/20 text-charcoal text-sm font-semibold hover:bg-charcoal hover:text-off-white transition-all duration-200"
            >
              Request Tickets
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
