import { supabase } from "@/lib/supabase";
import type { AboutContent } from "@/lib/supabase";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";

export const revalidate = 300;

export const metadata = {
  title: "About | Mad Hatter Comedy Club",
  description: "Learn about Mad Hatter Comedy Club, Chicago's premier comedy venue.",
};

async function getAboutContent(): Promise<Record<string, AboutContent>> {
  const { data } = await supabase.from("about_content").select("*");
  if (!data) return {};
  return Object.fromEntries(data.map((item) => [item.section_key, item]));
}

export default async function AboutPage() {
  const content = await getAboutContent();

  const hero = content["hero"];
  const story = content["story"];
  const venue = content["venue"];
  const address = content["address"];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Our Story
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">About</span>
              <span className="font-display font-semibold text-charcoal block">
                {hero?.title ?? "Mad Hatter"}
              </span>
            </h1>
            {hero?.content && (
              <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                {hero.content}
              </p>
            )}
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Est. 2015</span>
              <div className="w-12 h-px bg-charcoal/10" />
            </div>
          </div>
        </Reveal>

        {/* Story + Venue sections */}
        <div className="space-y-16">
          {story && (
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-charcoal mb-4 tracking-tight">
                    {story.title}
                  </h2>
                  <p className="text-muted leading-loose">{story.content}</p>
                </div>
                <div className="bg-off-white-2 border border-charcoal/10 p-8 text-center aspect-square flex items-center justify-center">
                  <div>
                    <svg className="w-16 h-16 text-gold/20 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5A7.5 7.5 0 0112 18m0 0v3m0 0H9m3 0h3" />
                    </svg>
                    <span className="font-display text-3xl text-muted/20">MH</span>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {venue && (
            <Reveal>
              <div className="bg-charcoal grain p-8 sm:p-10">
                <div className="relative z-[2]">
                  <h2 className="font-display text-2xl font-semibold text-off-white mb-4 tracking-tight">
                    {venue.title}
                  </h2>
                  <p className="text-muted-dark leading-loose">{venue.content}</p>
                </div>
              </div>
            </Reveal>
          )}

          {/* Stats — bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Reveal delay={0}>
              <div className="col-span-1 bg-charcoal grain p-8 flex flex-col justify-end min-h-[160px]">
                <div className="font-display text-3xl font-semibold text-gold relative z-[2]">Since 2015</div>
                <div className="font-mono text-xs text-muted-dark mt-1 uppercase tracking-wide relative z-[2]">In Chicago</div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="bg-off-white-2 border border-charcoal/10 p-6 flex flex-col justify-center text-center min-h-[160px]">
                <div className="font-display text-4xl font-semibold text-charcoal">
                  <CountUp end={200} />
                </div>
                <div className="font-mono text-xs text-muted mt-1 uppercase tracking-wide">Seats</div>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="bg-off-white-2 border border-charcoal/10 p-6 flex flex-col justify-center text-center min-h-[160px]">
                <div className="font-display text-4xl font-semibold text-charcoal">
                  <CountUp end={200} suffix="+" />
                </div>
                <div className="font-mono text-xs text-muted mt-1 uppercase tracking-wide">Shows Hosted</div>
              </div>
            </Reveal>
          </div>

          {/* Address */}
          {address && (
            <Reveal>
              <div className="border-t border-charcoal/10 pt-12 text-center">
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-4 tracking-tight">
                  {address.title}
                </h2>
                <p className="text-muted leading-relaxed">{address.content}</p>
                <Link
                  href="/tickets"
                  className="inline-block mt-6 px-8 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-all duration-200 active:scale-[0.98]"
                >
                  Book a Table
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
