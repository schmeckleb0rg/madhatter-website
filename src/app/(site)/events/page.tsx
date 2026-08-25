import { supabase } from "@/lib/supabase";
import type { Event, EventSlideshow } from "@/lib/supabase";
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

export default async function EventsPage() {
  const [events, pageContent, tickerItems, slideshowData] = await Promise.all([
    getEvents(),
    getPageContent(),
    getTickerItems(),
    getSlideshowData(),
  ]);

  return (
    <>
      <EventsClient
        events={events}
        pageContent={pageContent}
        tickerItems={tickerItems}
        slideshowSlides={slideshowData.slides}
        slideshowSpeed={slideshowData.speed}
      />
      {events.map((event) => (
        <EventSchema key={`schema-${event.id}`} event={event} />
      ))}
    </>
  );
}
