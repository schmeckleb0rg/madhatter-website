import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/lib/supabase";

export function formatDate(dateStr: string) {
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

function getTimingBadge(dateStr: string) {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "Tonight", color: "#9C4A38", bg: "rgba(156,74,56,0.10)" };
  if (diffDays === 1) return { label: "Tomorrow", color: "#96793A", bg: "rgba(150,121,58,0.12)" };
  if (diffDays <= 7) return { label: "This Week", color: "#2F6E52", bg: "rgba(47,110,82,0.10)" };
  return null;
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
  const timing = getTimingBadge(event.date);

  return (
    <div className="group bg-white border border-charcoal/10 overflow-hidden hover:border-charcoal/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5">
      {/* Image */}
      <div className="relative h-40 sm:h-48 bg-off-white-2 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-off-white-2 gap-2">
            <svg className="w-10 h-10 text-gold/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5A7.5 7.5 0 0112 18m0 0v3m0 0H9m3 0h3" />
            </svg>
            <span className="font-mono text-xs text-muted/40 uppercase tracking-widest">Show</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {event.is_featured && (
            <span className="px-2 py-1 bg-gold text-white text-xs font-mono font-medium tracking-wider uppercase">
              Featured
            </span>
          )}
          {timing && !event.is_sold_out && (
            <span
              className="font-mono text-xs font-medium px-2 py-1"
              style={{ color: timing.color, backgroundColor: timing.bg }}
            >
              {timing.label}
            </span>
          )}
        </div>
        {event.is_sold_out && (
          <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
            <span className="font-mono text-off-white font-medium text-sm tracking-widest uppercase">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex gap-3 sm:gap-4">
        {/* Date block */}
        <div className="flex-shrink-0 text-center w-10 sm:w-12">
          <div className="font-mono text-[10px] sm:text-xs font-medium text-gold">{date.month}</div>
          <div className="text-xl sm:text-2xl font-bold text-charcoal leading-none">{date.day}</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-charcoal truncate">{event.title}</h3>
          {event.performer && (
            <p className="text-sm text-muted mt-0.5">{event.performer}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
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
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          {event.ticket_price_cents && event.ticket_capacity ? (
            <Link
              href={`/tickets/${event.id}`}
              className="block w-full text-center py-3 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-all duration-200 active:scale-[0.98]"
            >
              Buy Tickets — ${(event.ticket_price_cents / 100).toFixed(2)}
            </Link>
          ) : (
            <Link
              href={`/tickets?event=${event.id}`}
              className="block w-full text-center py-3 border border-charcoal/20 text-charcoal text-sm font-semibold hover:bg-charcoal hover:text-off-white transition-all duration-200"
            >
              Request Tickets
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
