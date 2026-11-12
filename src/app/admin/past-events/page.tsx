export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

type PastShowEntry = {
  id: string;
  title: string;
  performer: string | null;
  date: string;
  source: "manual" | "auto";
};

async function getPastShows(): Promise<PastShowEntry[]> {
  const db = getAdminClient();

  // Use Eastern Time for "today" boundary
  const now = new Date();
  const etNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const todayET = `${etNow.getFullYear()}-${String(etNow.getMonth() + 1).padStart(2, "0")}-${String(etNow.getDate()).padStart(2, "0")}`;

  const [{ data: manualPastEvents }, { data: archivedEvents }] = await Promise.all([
    db.from("past_events").select("id, title, performer, date").order("date", { ascending: false }),
    db.from("events").select("id, title, performer, date").lt("date", todayET).order("date", { ascending: false }),
  ]);

  const manual: PastShowEntry[] = (manualPastEvents ?? []).map((e) => ({ ...e, source: "manual" as const }));
  const auto: PastShowEntry[] = (archivedEvents ?? []).map((e) => ({ ...e, source: "auto" as const }));

  // Merge, dedup by title+date, sort descending
  const all = [...manual, ...auto];
  const seen = new Set<string>();
  const deduped = all.filter((e) => {
    const key = `${e.title}::${e.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  deduped.sort((a, b) => b.date.localeCompare(a.date));
  return deduped;
}

export default async function AdminPastEventsPage() {
  const events = await getPastShows();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <PageVisibilityToggle pageKey="past_events" label="Past Productions" />
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
              key={`${event.source}-${event.id}`}
              href={event.source === "auto" ? `/admin/events/${event.id}` : `/admin/past-events/${event.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-charcoal/10 px-4 sm:px-5 py-3 sm:py-4 hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-center w-10 flex-shrink-0">
                  <div className="text-xs text-gold font-bold">
                    {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" }).toUpperCase()}
                  </div>
                  <div className="text-xl font-bold text-charcoal leading-none">
                    {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", timeZone: "America/Chicago" })}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-charcoal truncate">
                    {event.title}
                    {event.source === "auto" && (
                      <span className="ml-2 text-xs text-gold font-normal">(from Events)</span>
                    )}
                  </div>
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
