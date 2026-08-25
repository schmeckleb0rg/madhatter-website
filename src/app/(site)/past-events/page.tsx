import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { PastEvent } from "@/lib/supabase";

export const revalidate = 300;

export const metadata = {
  title: "Past Shows | Mad Hatter Comedy Club",
  description: "A look back at the incredible comedians who've graced the Mad Hatter stage.",
};

async function getPastEvents(): Promise<PastEvent[]> {
  const { data } = await supabase
    .from("past_events")
    .select("*")
    .order("date", { ascending: false });
  return data ?? [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PastEventsPage() {
  const events = await getPastEvents();

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
