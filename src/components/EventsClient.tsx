"use client";

import { useState } from "react";
import type { Event, EventSlideshow, EventGenre } from "@/lib/supabase";
import EventCard from "@/components/EventCard";
import FeaturedEventHero from "@/components/FeaturedEventHero";
import Marquee from "@/components/Marquee";
import MediaSlideshow from "@/components/MediaSlideshow";
import EventDetailPopup from "@/components/EventDetailPopup";
import EventCalendar from "@/components/EventCalendar";
import GenreFilterBar from "@/components/GenreFilterBar";
import Reveal from "@/components/Reveal";
import { isJustAnnounced } from "@/lib/badges";

type EventsClientProps = {
  events: Event[];
  pageContent: Record<string, string>;
  tickerItems: string[];
  slideshowSlides: EventSlideshow[];
  slideshowSpeed: number;
  justAnnouncedDays?: number;
  sellingFastThreshold?: number;
  allGenres?: EventGenre[];
};

export default function EventsClient({
  events,
  pageContent,
  tickerItems,
  slideshowSlides,
  slideshowSpeed,
  justAnnouncedDays = 14,
  sellingFastThreshold = 70,
  allGenres = [],
}: EventsClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"gallery" | "calendar">("gallery");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  function toggleGenre(genreId: string) {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((g) => g !== genreId) : [...prev, genreId]
    );
  }

  // Filter events by selected genres and search
  let filteredEvents = selectedGenres.length > 0
    ? events.filter((e) => e.genres?.some((g) => selectedGenres.includes(g.id)))
    : events;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (e) => e.title.toLowerCase().includes(q) || e.performer?.toLowerCase().includes(q)
    );
  }

  const featuredEvent = filteredEvents.find((e) => e.is_featured);
  const regularEvents = filteredEvents.filter((e) => e.id !== featuredEvent?.id);
  const justAnnouncedEvents = regularEvents
    .filter((e) => isJustAnnounced(e, justAnnouncedDays) && !e.is_sold_out)
    .slice(0, 3);
  const hasJustAnnounced = justAnnouncedEvents.length > 0;

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
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              {subtitle}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">{titleLine1}</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">{titleLine2}</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">{badge}</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
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
              <p className="text-muted text-lg dark:text-[#7A7264]">No shows on the calendar right now.</p>
              <p className="text-muted text-sm mt-2 dark:text-[#7A7264]">Check back soon — new dates go up regularly.</p>
            </div>
          </Reveal>
        ) : (
          <>
            {/* Featured event hero */}
            {featuredEvent && (
              <Reveal className="mb-10">
                <div onClick={() => setSelectedEvent(featuredEvent)} className="cursor-pointer">
                  <FeaturedEventHero event={featuredEvent} justAnnouncedDays={justAnnouncedDays} sellingFastThreshold={sellingFastThreshold} />
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
            {/* Genre filter */}
            {allGenres.length > 0 && (
              <Reveal>
                <div className="mb-6">
                  <GenreFilterBar genres={allGenres} selected={selectedGenres} onToggle={toggleGenre} />
                </div>
              </Reveal>
            )}

            {/* Search + Calendar toggle */}
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-[#7A7264]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shows..."
                    className="w-full bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 pl-9 pr-4 py-2 text-sm text-charcoal dark:text-[#F0ECE3] placeholder:text-muted/50 dark:placeholder:text-[#7A7264]/50 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setViewMode(viewMode === "gallery" ? "calendar" : "gallery")}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-charcoal/10 dark:border-gold/10 text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] hover:border-gold/30 transition-colors"
                  title={viewMode === "gallery" ? "Calendar view" : "Gallery view"}
                >
                  {viewMode === "gallery" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                    </svg>
                  )}
                </button>
              </div>
            </Reveal>

            {viewMode === "gallery" ? (
              <>
                {/* Just Announced section */}
                {hasJustAnnounced && (
                  <Reveal className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="px-3 py-1.5 text-xs font-mono font-medium tracking-wider uppercase" style={{ color: "#1A7A6D", backgroundColor: "rgba(26,122,109,0.10)" }}>
                        Just Announced
                      </span>
                      <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/10" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {justAnnouncedEvents.map((event, i) => (
                        <Reveal key={event.id} delay={i * 80}>
                          <div onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                            <EventCard event={event} justAnnouncedDays={justAnnouncedDays} sellingFastThreshold={sellingFastThreshold} />
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </Reveal>
                )}

                {/* Regular events grid */}
                {regularEvents.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {regularEvents.map((event, i) => (
                      <Reveal key={event.id} delay={i * 80}>
                        <div onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                          <EventCard event={event} justAnnouncedDays={justAnnouncedDays} sellingFastThreshold={sellingFastThreshold} />
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </>
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
