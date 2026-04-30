import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import EventCard from "@/components/EventCard";

export const revalidate = 60;

export const metadata = {
  title: "Upcoming Events | Mad Hatter Comedy Club",
  description: "See what's coming up at Mad Hatter Comedy Club in Chicago.",
};

async function getEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });
  return data ?? [];
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-red text-xs font-bold tracking-widest uppercase mb-3">
            What&apos;s On
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Upcoming Shows
          </h1>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-20">🎩</div>
            <p className="text-gray-500 text-lg">No upcoming shows right now.</p>
            <p className="text-gray-600 text-sm mt-2">Check back soon — something&apos;s always brewing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
