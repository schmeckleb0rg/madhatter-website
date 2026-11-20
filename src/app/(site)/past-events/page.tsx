import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { PastEvent } from "@/lib/supabase";

export const revalidate = 300;

export const metadata = {
  title: "MadHatter Comedy Club | Past Shows",
  description: "A look back at the incredible comedians who've graced the MadHatter stage.",
};

type PastShowCard = {
  id: string;
  title: string;
  description: string | null;
  performer: string | null;
  date: string;
  image_url: string | null;
};

async function getPastShows(): Promise<PastShowCard[]> {
  // Use Eastern Time for "today" boundary (venue timezone)
  const now = new Date();
  const etNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const todayET = `${etNow.getFullYear()}-${String(etNow.getMonth() + 1).padStart(2, "0")}-${String(etNow.getDate()).padStart(2, "0")}`;

  const [{ data: manualPastEvents }, { data: archivedEvents }] = await Promise.all([
    supabase
      .from("past_events")
      .select("id, title, description, performer, date, image_url")
      .order("date", { ascending: false }),
    supabase
      .from("events")
      .select("id, title, description, performer, date, image_url")
      .lt("date", todayET)
      .order("date", { ascending: false }),
  ]);

  // Merge both sources, dedup by title+date, sort by date descending
  const all: PastShowCard[] = [...(manualPastEvents ?? []), ...(archivedEvents ?? [])];
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

function formatDate(dateStr: string) {
  const dateOnly = dateStr.slice(0, 10); // extract YYYY-MM-DD from possible ISO timestamp
  return new Date(dateOnly + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  });
}

export default async function PastEventsPage() {
  const events = await getPastShows();

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            The Archives
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-charcoal dark:text-[#F0ECE3]">
            Past Shows
          </h1>
          <p className="mt-4 text-muted dark:text-[#7A7264] max-w-lg mx-auto">
            A look back at the legends who&apos;ve graced our stage.
          </p>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              The Archives
            </p>
            <p className="text-muted dark:text-[#7A7264] text-lg">No past shows yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden group"
              >
                <div className="relative h-44 bg-off-white-2 dark:bg-[#161412]">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-off-white-2 dark:bg-[#161412]">
                      <span className="font-display text-2xl text-muted/30">MH</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-mono text-xs text-gold mb-1">{formatDate(event.date)}</p>
                  <h3 className="font-display font-semibold text-charcoal dark:text-[#F0ECE3]">
                    {event.title}
                  </h3>
                  {event.performer && (
                    <p className="text-sm text-muted dark:text-[#7A7264] mt-1">{event.performer}</p>
                  )}
                  {event.description && (
                    <p className="text-xs text-muted dark:text-[#7A7264] mt-2 line-clamp-2">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
