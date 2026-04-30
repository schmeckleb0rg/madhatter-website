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
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-gold text-xs font-bold tracking-widest uppercase mb-3">
            The Archives
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Past Shows
          </h1>
          <p className="mt-4 text-gray-500 max-w-lg mx-auto">
            A look back at the legends who&apos;ve graced our stage.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-20">🎩</div>
            <p className="text-gray-500 text-lg">No past shows yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-club-card border border-club-border rounded-lg overflow-hidden group"
              >
                <div className="relative h-44 bg-club-bg">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-5xl opacity-10">🎩</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-club-card/80 to-transparent" />
                </div>
                <div className="p-5">
                  <p className="text-xs text-club-gold mb-1">{formatDate(event.date)}</p>
                  <h3
                    className="font-semibold text-white"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {event.title}
                  </h3>
                  {event.performer && (
                    <p className="text-sm text-gray-400 mt-1">{event.performer}</p>
                  )}
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{event.description}</p>
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
