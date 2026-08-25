import { supabase } from "@/lib/supabase";
import type { Comedian, Event } from "@/lib/supabase";
import ComedianCard from "@/components/ComedianCard";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Comedians | Mad Hatter Comedy Club",
  description: "Meet the comedians who perform at Mad Hatter Comedy Club in Chicago.",
};

async function getComedians(): Promise<Comedian[]> {
  const { data } = await supabase
    .from("comedians")
    .select("*")
    .order("name", { ascending: true });
  return data ?? [];
}

async function getUpcomingEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from("events")
    .select("id, performer, comedian_id")
    .gte("date", new Date().toISOString());
  return (data as Event[]) ?? [];
}

function comedianHasUpcomingShow(comedian: Comedian, events: Event[]): boolean {
  return events.some(
    (e) =>
      (e.comedian_id && e.comedian_id === comedian.id) ||
      (e.performer && comedian.name && e.performer.toLowerCase() === comedian.name.toLowerCase())
  );
}

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("section_key, content")
    .eq("page_key", "comedians");
  const content: Record<string, string> = {};
  (data ?? []).forEach((r: { section_key: string; content: string }) => {
    content[r.section_key] = r.content;
  });
  return content;
}

export default async function ComediansPage() {
  const [comedians, events, content] = await Promise.all([
    getComedians(),
    getUpcomingEvents(),
    getPageContent(),
  ]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              {content.subtitle || "The Lineup"}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">
                {content.title_line1 || "Our"}
              </span>
              <span className="font-display font-semibold text-charcoal block">
                {content.title_line2 || "Comedians"}
              </span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">
                {content.badge || "The Talent"}
              </span>
              <div className="w-12 h-px bg-charcoal/10" />
            </div>
          </div>
        </Reveal>

        {comedians.length === 0 ? (
          <Reveal>
            <div className="text-center py-20">
              <svg className="w-12 h-12 text-gold/30 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5A7.5 7.5 0 0112 18m0 0v3m0 0H9m3 0h3" />
              </svg>
              <p className="text-muted text-lg">No comedians listed yet.</p>
              <p className="text-muted text-sm mt-2">Check back soon — the lineup is always growing.</p>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comedians.map((comedian, i) => (
              <Reveal key={comedian.id} delay={i * 80}>
                <ComedianCard
                  comedian={comedian}
                  hasUpcomingShow={comedianHasUpcomingShow(comedian, events)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
