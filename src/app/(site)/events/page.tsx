import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import EventCard from "@/components/EventCard";
import { EventSchema } from "@/components/StructuredData";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import FeaturedEventHero from "@/components/FeaturedEventHero";

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
  const featuredEvent = events.find((e) => e.is_featured);
  const regularEvents = events.filter((e) => e.id !== featuredEvent?.id);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              What&apos;s On
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">Upcoming</span>
              <span className="font-display font-semibold text-charcoal block">Shows</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Live Comedy</span>
              <div className="w-12 h-px bg-charcoal/10" />
            </div>
          </div>
        </Reveal>

        {events.length === 0 ? (
          <Reveal>
            <div className="text-center py-20">
              <svg className="w-12 h-12 text-gold/30 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5A7.5 7.5 0 0112 18m0 0v3m0 0H9m3 0h3" />
              </svg>
              <p className="text-muted text-lg">No shows on the calendar right now.</p>
              <p className="text-muted text-sm mt-2">Check back soon — new dates go up regularly.</p>
            </div>
          </Reveal>
        ) : (
          <>
            {/* Featured event hero */}
            {featuredEvent && (
              <Reveal className="mb-10">
                <FeaturedEventHero event={featuredEvent} />
              </Reveal>
            )}

            {/* Marquee */}
            {events.length > 2 && (
              <div className="mb-10 -mx-4 sm:-mx-6">
                <Marquee
                  items={[
                    "Live Stand-Up Comedy",
                    `${events.length} Upcoming Shows`,
                    "Book Your Tickets Now",
                    "Chicago's Best Comedy Club",
                    "New Shows Added Weekly",
                  ]}
                />
              </div>
            )}

            {/* Regular events grid */}
            {regularEvents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularEvents.map((event, i) => (
                  <Reveal key={event.id} delay={i * 80}>
                    <EventCard event={event} />
                  </Reveal>
                ))}
              </div>
            )}

            {events.map((event) => (
              <EventSchema key={`schema-${event.id}`} event={event} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
