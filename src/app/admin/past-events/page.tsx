export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";
import PastShowsClient from "@/components/admin/PastShowsClient";

export type PastShowEntry = {
  id: string;
  title: string;
  performer: string | null;
  date: string;
  image_url: string | null;
  source: "manual" | "auto";
};

async function getPastShows(): Promise<PastShowEntry[]> {
  const db = getAdminClient();

  // Use Central Time for "today" boundary (venue timezone)
  const now = new Date();
  const ctNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const todayCT = `${ctNow.getFullYear()}-${String(ctNow.getMonth() + 1).padStart(2, "0")}-${String(ctNow.getDate()).padStart(2, "0")}`;

  const [{ data: manualPastEvents }, { data: archivedEvents }] = await Promise.all([
    db.from("past_events").select("id, title, performer, date, image_url").order("date", { ascending: false }),
    db.from("events").select("id, title, performer, date, image_url").lt("date", todayCT).order("date", { ascending: false }),
  ]);

  const manual: PastShowEntry[] = (manualPastEvents ?? []).map((e) => ({ ...e, source: "manual" as const }));
  const auto: PastShowEntry[] = (archivedEvents ?? []).map((e) => ({ ...e, source: "auto" as const }));

  // Merge, dedup by title+date, sort descending
  const all = [...manual, ...auto];
  const seen = new Set<string>();
  const deduped = all.filter((e) => {
    const key = `${e.title}::${e.date.slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  deduped.sort((a, b) => b.date.slice(0, 10).localeCompare(a.date.slice(0, 10)));
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
        <PastShowsClient events={events} />
      )}
    </div>
  );
}
