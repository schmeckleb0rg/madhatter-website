import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import EventCard from "@/components/EventCard";
import { EventSchema } from "@/components/StructuredData";

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
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            What&apos;s On
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
            Upcoming Shows
          </h1>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              What&apos;s On
            </p>
            <p className="text-muted text-lg">No shows on the calendar right now.</p>
            <p className="text-muted text-sm mt-2">Check back soon — new dates go up regularly.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {events.map((event) => (
              <EventSchema key={`schema-${event.id}`} event={event} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
