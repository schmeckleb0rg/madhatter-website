import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/lib/supabase";
import { formatDate } from "@/components/EventCard";

export default function FeaturedEventHero({ event }: { event: Event }) {
  const date = formatDate(event.date);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 border border-charcoal/10 overflow-hidden group">
      {/* Image */}
      <div className="relative h-64 lg:h-96 bg-off-white-2 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-off-white-2 gap-3">
            <svg className="w-16 h-16 text-gold/30" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5A7.5 7.5 0 0112 18m0 0v3m0 0H9m3 0h3" />
            </svg>
            <span className="font-display text-3xl text-muted/20">MH</span>
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 bg-gold font-mono text-xs text-white tracking-widest uppercase">
          Featured
        </div>
        {event.is_sold_out && (
          <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
            <span className="font-mono text-off-white font-medium text-lg tracking-widest uppercase">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-charcoal grain p-8 lg:p-12 flex flex-col justify-between">
        <div className="relative z-[2]">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-4">
            {date.full}
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-off-white leading-tight mb-4 tracking-tight">
            {event.title}
          </h2>
          {event.performer && (
            <p className="text-muted-dark text-lg">{event.performer}</p>
          )}
          {event.description && (
            <p className="text-muted-dark text-sm mt-3 line-clamp-2 leading-relaxed">{event.description}</p>
          )}
        </div>
        <div className="mt-8 flex items-center gap-4 relative z-[2]">
          {!event.is_sold_out && (
            <>
              {event.ticket_price_cents && event.ticket_capacity ? (
                <Link
                  href={`/tickets/${event.id}`}
                  className="px-6 py-3 bg-gold text-white font-semibold text-sm hover:bg-gold-soft hover:text-charcoal transition-colors"
                >
                  Get Tickets — ${(event.ticket_price_cents / 100).toFixed(2)}
                </Link>
              ) : (
                <Link
                  href={`/tickets?event=${event.id}`}
                  className="px-6 py-3 border border-off-white/30 text-off-white font-semibold text-sm hover:bg-off-white hover:text-charcoal transition-colors"
                >
                  Request Tickets
                </Link>
              )}
            </>
          )}
          {event.show_time && (
            <span className="font-mono text-xs text-muted-dark">{event.show_time}</span>
          )}
          {event.doors_time && (
            <span className="font-mono text-xs text-muted-dark">Doors {event.doors_time}</span>
          )}
        </div>
      </div>
    </div>
  );
}
