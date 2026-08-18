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

export default function EventCard({ event }: { event: Event }) {
  const date = formatDate(event.date);

  return (
    <div className="group bg-club-card border border-club-border rounded-lg overflow-hidden hover:border-club-gold/40 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-club-bg overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-6xl opacity-20">🎩</span>
          </div>
        )}
        {event.is_featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-club-gold text-black text-xs font-bold rounded">
            FEATURED
          </div>
        )}
        {event.is_sold_out && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex gap-4">
        {/* Date block */}
        <div className="flex-shrink-0 text-center w-12">
          <div className="text-xs font-bold text-club-red">{date.month}</div>
          <div className="text-2xl font-bold text-white leading-none">{date.day}</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{event.title}</h3>
          {event.performer && (
            <p className="text-sm text-club-gold mt-0.5">{event.performer}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {event.show_time && <span>Show: {event.show_time}</span>}
            {event.ticket_price_cents ? (
              <span>${(event.ticket_price_cents / 100).toFixed(2)}</span>
            ) : (
              event.ticket_price && <span>{event.ticket_price}</span>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      {!event.is_sold_out && (
        <div className="px-5 pb-5">
          {event.ticket_price_cents && event.ticket_capacity ? (
            <>
              <Link
                href={`/tickets/${event.id}`}
                className="block w-full text-center py-2 bg-club-red text-white text-sm font-semibold rounded hover:bg-red-700 transition-all duration-200"
              >
                Buy Tickets — ${(event.ticket_price_cents / 100).toFixed(2)}
              </Link>
              {event.ticket_capacity - (event.tickets_sold ?? 0) <= Math.ceil(event.ticket_capacity * 0.2) && (
                <p className="text-xs text-club-red text-center mt-2">
                  Only {event.ticket_capacity - (event.tickets_sold ?? 0)} left!
                </p>
              )}
            </>
          ) : (
            <Link
              href={`/tickets?event=${event.id}`}
              className="block w-full text-center py-2 bg-club-red/10 border border-club-red/30 text-club-red text-sm font-semibold rounded hover:bg-club-red hover:text-white transition-all duration-200"
            >
              Request Tickets
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
