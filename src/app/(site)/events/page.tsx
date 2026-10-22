import { supabase } from "@/lib/supabase";
import type { Event, EventSlideshow, EventGenre } from "@/lib/supabase";
import { EventSchema } from "@/components/StructuredData";
import EventsClient from "@/components/EventsClient";

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
    .neq("is_cancelled", true)
    .order("date", { ascending: true });
  return data ?? [];
}

async function getPageContent(): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("page_content")
    .select("section_key, content")
    .eq("page_key", "events");
  if (!data) return {};
  return Object.fromEntries(data.map((item) => [item.section_key, item.content]));
}

async function getTickerItems(): Promise<string[]> {
  const { data } = await supabase
    .from("page_content")
    .select("section_key, content")
    .eq("page_key", "events")
    .like("section_key", "ticker/%")
    .order("section_key", { ascending: true });
  if (!data || data.length === 0) return [];
  return data.map((item) => item.content);
}

async function getSlideshowData(): Promise<{ slides: EventSlideshow[]; speed: number }> {
  const [slidesRes, speedRes] = await Promise.all([
    supabase
      .from("event_slideshow")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "slideshow_speed")
      .single(),
  ]);

  return {
    slides: slidesRes.data ?? [],
    speed: speedRes.data?.value ? parseInt(speedRes.data.value, 10) : 5,
  };
}

async function getGenres(): Promise<EventGenre[]> {
  const { data } = await supabase
    .from("event_genres")
    .select("*")
    .order("name", { ascending: true });
  return (data as EventGenre[]) ?? [];
}

async function getEventGenreMap(): Promise<Record<string, string[]>> {
  const { data } = await supabase
    .from("event_genre_assignments")
    .select("event_id, genre_id");
  if (!data) return {};
  const map: Record<string, string[]> = {};
  for (const row of data) {
    if (!map[row.event_id]) map[row.event_id] = [];
    map[row.event_id].push(row.genre_id);
  }
  return map;
}

async function getBadgeSettings(): Promise<{ justAnnouncedDays: number; sellingFastThreshold: number }> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["just_announced_days", "selling_fast_default_threshold"]);
  const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
  return {
    justAnnouncedDays: parseInt(map.just_announced_days ?? "14", 10),
    sellingFastThreshold: parseInt(map.selling_fast_default_threshold ?? "70", 10),
  };
}

export default async function EventsPage() {
  const [events, pageContent, tickerItems, slideshowData, badgeSettings, allGenres, genreMap] = await Promise.all([
    getEvents(),
    getPageContent(),
    getTickerItems(),
    getSlideshowData(),
    getBadgeSettings(),
    getGenres(),
    getEventGenreMap(),
  ]);

  // Attach genres to events
  const eventsWithGenres = events.map((event) => ({
    ...event,
    genres: allGenres.filter((g) => genreMap[event.id]?.includes(g.id)),
  }));

  return (
    <>
      <EventsClient
        events={eventsWithGenres}
        pageContent={pageContent}
        tickerItems={tickerItems}
        slideshowSlides={slideshowData.slides}
        slideshowSpeed={slideshowData.speed}
        justAnnouncedDays={badgeSettings.justAnnouncedDays}
        sellingFastThreshold={badgeSettings.sellingFastThreshold}
        allGenres={allGenres}
      />
      {events.map((event) => (
        <EventSchema key={`schema-${event.id}`} event={event} />
      ))}
    </>
  );
}
