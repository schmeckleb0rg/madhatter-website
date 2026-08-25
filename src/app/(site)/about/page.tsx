import { supabase } from "@/lib/supabase";
import type { AboutContent } from "@/lib/supabase";
import Link from "next/link";
import Reveal from "@/components/Reveal";

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

async function getPageContent(pageKey: string): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("page_content")
    .select("section_key, content")
    .eq("page_key", pageKey);
  if (!data) return {};
  return Object.fromEntries(data.map((item) => [item.section_key, item.content]));
}

export default async function AboutPage() {
  const [content, pageContent] = await Promise.all([
    getAboutContent(),
    getPageContent("about"),
  ]);

  const hero = content["hero"];
  const story = content["story"];
  const venue = content["venue"];
  const address = content["address"];

  const estText = pageContent["est_year"] || "Est. 2026";
  const subtitle = pageContent["subtitle"] || "Our Story";
  const badge = pageContent["badge"] || estText;

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              {subtitle}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted dark:text-[#7A7264] block">About</span>
              <span className="font-display font-semibold text-charcoal dark:text-[#F0ECE3] block">
                {hero?.title ?? "Mad Hatter"}
              </span>
            </h1>
            {hero?.content && (
              <p className="mt-6 text-lg text-muted dark:text-[#7A7264] max-w-2xl mx-auto leading-relaxed">
                {hero.content}
              </p>
            )}
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">{badge}</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {/* Story + Venue sections */}
        <div className="space-y-16">
          {story && (
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4 tracking-tight">
                    {story.title}
                  </h2>
                  <p className="text-muted dark:text-[#C4BDA8] leading-loose">{story.content}</p>
                </div>
                <div className="bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 p-8 text-center aspect-square flex items-center justify-center">
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
              <div className="bg-charcoal grain dark:bg-[#080706] p-8 sm:p-10">
                <div className="relative z-[2]">
                  <h2 className="font-display text-2xl font-semibold text-off-white mb-4 tracking-tight">
                    {venue.title}
                  </h2>
                  <p className="text-muted-dark leading-loose">{venue.content}</p>
                </div>
              </div>
            </Reveal>
          )}

          {/* Address */}
          {address && (
            <Reveal>
              <div className="border-t border-charcoal/10 dark:border-gold/10 pt-12 text-center">
                <h2 className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4 tracking-tight">
                  {address.title}
                </h2>
                <p className="text-muted dark:text-[#C4BDA8] leading-relaxed">{address.content}</p>
                <Link
                  href="/contact"
                  className="inline-block mt-6 px-8 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-all duration-200 active:scale-[0.98] dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B] btn-shimmer"
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
