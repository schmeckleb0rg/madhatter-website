export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";
import type { PastEvent } from "@/lib/supabase";

async function getPastEvents(): Promise<PastEvent[]> {
  const db = getAdminClient();
  const { data } = await db.from("past_events").select("*").order("date", { ascending: false });
  return data ?? [];
}

export default async function AdminPastEventsPage() {
  const events = await getPastEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">
          Past Shows
        </h1>
        <Link
          href="/admin/past-events/new"
          className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-colors"
        >
          + Add Past Show
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-muted">No past shows yet.</div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/past-events/${event.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-charcoal/10 px-4 sm:px-5 py-3 sm:py-4 hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-center w-10 flex-shrink-0">
                  <div className="text-xs text-gold font-bold">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </div>
                  <div className="text-xl font-bold text-charcoal leading-none">
                    {new Date(event.date).getDate()}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-charcoal truncate">{event.title}</div>
                  {event.performer && (
                    <div className="text-xs text-muted">{event.performer}</div>
                  )}
                </div>
              </div>
              <span className="text-muted text-sm group-hover:text-charcoal transition-colors">&rarr;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
