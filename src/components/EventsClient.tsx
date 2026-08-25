"use client";

import { useState } from "react";
import type { Event, EventSlideshow } from "@/lib/supabase";
import EventCard from "@/components/EventCard";
import FeaturedEventHero from "@/components/FeaturedEventHero";
import Marquee from "@/components/Marquee";
import MediaSlideshow from "@/components/MediaSlideshow";
import EventDetailPopup from "@/components/EventDetailPopup";
import EventCalendar from "@/components/EventCalendar";
import Reveal from "@/components/Reveal";

type EventsClientProps = {
  events: Event[];
  pageContent: Record<string, string>;
  tickerItems: string[];
  slideshowSlides: EventSlideshow[];
  slideshowSpeed: number;
};

export default function EventsClient({
  events,
  pageContent,
  tickerItems,
  slideshowSlides,
  slideshowSpeed,
}: EventsClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const featuredEvent = events.find((e) => e.is_featured);
  const regularEvents = events.filter((e) => e.id !== featuredEvent?.id);

  const subtitle = pageContent["subtitle"] || "What's On";
  const titleLine1 = pageContent["title_line_1"] || "Upcoming";
  const titleLine2 = pageContent["title_line_2"] || "Shows";
  const badge = pageContent["badge"] || "Live Comedy";

  // Ticker: use DB items if available, otherwise defaults
  const marqueeItems =
    tickerItems.length > 0
      ? tickerItems
      : [
          "Live Stand-Up Comedy",
          `${events.length} Upcoming Shows`,
          "Book Your Tickets Now",
          "Chicago's Best Comedy Club",
          "New Shows Added Weekly",
        ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              {subtitle}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">{titleLine1}</span>
              <span className="font-display font-semibold text-charcoal block">{titleLine2}</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">{badge}</span>
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
                <div onClick={() => setSelectedEvent(featuredEvent)} className="cursor-pointer">
                  <FeaturedEventHero event={featuredEvent} />
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>

      {/* Full-width Marquee */}
      {events.length > 2 && (
        <div className="mb-10">
          <Marquee items={marqueeItems} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {events.length > 0 && (
          <>
            {/* View toggle */}
            <Reveal>
              <div className="flex items-center justify-end gap-2 mb-6">
                <button
                  onClick={() => setViewMode("list")}
                  className={`font-mono text-xs tracking-wide px-3 py-1.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-charcoal text-off-white"
                      : "border border-charcoal/20 text-muted hover:text-charcoal"
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`font-mono text-xs tracking-wide px-3 py-1.5 transition-colors ${
                    viewMode === "calendar"
                      ? "bg-charcoal text-off-white"
                      : "border border-charcoal/20 text-muted hover:text-charcoal"
                  }`}
                >
                  Calendar View
                </button>
              </div>
            </Reveal>

            {viewMode === "list" ? (
              /* Regular events grid */
              regularEvents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularEvents.map((event, i) => (
                    <Reveal key={event.id} delay={i * 80}>
                      <div onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                        <EventCard event={event} />
                      </div>
                    </Reveal>
                  ))}
                </div>
              )
            ) : (
              <Reveal>
                <EventCalendar events={events} onEventClick={setSelectedEvent} />
              </Reveal>
            )}

            {/* Slideshow */}
            {slideshowSlides.length > 0 && (
              <Reveal className="mt-12">
                <MediaSlideshow
                  slides={slideshowSlides.map((s) => ({
                    image_url: s.image_url,
                    caption: s.caption,
                  }))}
                  speed={slideshowSpeed}
                />
              </Reveal>
            )}
          </>
        )}
      </div>

      {/* Event detail popup */}
      <EventDetailPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
