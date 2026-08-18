export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";
import type { Event } from "@/lib/supabase";

async function getEvents(): Promise<Event[]> {
  const db = getAdminClient();
  const { data } = await db.from("events").select("*").order("date", { ascending: true });
  return data ?? [];
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
          Upcoming Events
        </h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-club-red text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
        >
          + Add Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No events yet.</div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="flex items-center justify-between bg-club-card border border-club-border rounded-lg px-5 py-4 hover:border-club-gold/30 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-center w-10 flex-shrink-0">
                  <div className="text-xs text-club-red font-bold">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </div>
                  <div className="text-xl font-bold text-white leading-none">
                    {new Date(event.date).getDate()}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{event.title}</div>
                  {event.performer && (
                    <div className="text-xs text-gray-500">{event.performer}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {event.ticket_capacity ? (
                  <span className="text-xs px-2 py-0.5 bg-club-card border border-club-border text-gray-400 rounded">
                    {event.tickets_sold ?? 0}/{event.ticket_capacity} sold
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 text-gray-600 rounded">Inquiry only</span>
                )}
                {event.is_featured && (
                  <span className="text-xs px-2 py-0.5 bg-club-gold/10 text-club-gold rounded">Featured</span>
                )}
                {event.is_sold_out && (
                  <span className="text-xs px-2 py-0.5 bg-red-900/30 text-club-red rounded">Sold Out</span>
                )}
                <span className="text-gray-600 text-sm group-hover:text-white transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
