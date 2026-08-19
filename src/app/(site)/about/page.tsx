import { supabase } from "@/lib/supabase";
import type { AboutContent } from "@/lib/supabase";
import Link from "next/link";

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
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            Our Story
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
            {hero?.title ?? "About Mad Hatter"}
          </h1>
          {hero?.content && (
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              {hero.content}
            </p>
          )}
          <div className="w-16 h-0.5 bg-gold mt-6 mx-auto" />
        </div>

        {/* Story + Venue sections */}
        <div className="space-y-16">
          {story && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-4">
                  {story.title}
                </h2>
                <p className="text-muted leading-relaxed">{story.content}</p>
              </div>
              <div className="bg-off-white-2 border border-charcoal/10 p-8 text-center">
                <span className="font-display text-3xl text-muted/30">MH</span>
              </div>
            </div>
          )}

          {venue && (
            <div className="bg-charcoal p-8 sm:p-10">
              <h2 className="font-display text-2xl font-semibold text-off-white mb-4">
                {venue.title}
              </h2>
              <p className="text-muted-dark leading-relaxed">{venue.content}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "200", label: "Seats" },
              { value: "200+", label: "Shows Hosted" },
              { value: "Since 2015", label: "In Chicago" },
            ].map((stat) => (
              <div key={stat.label} className="bg-off-white-2 border border-charcoal/10 p-6">
                <div className="font-display text-2xl sm:text-3xl font-semibold text-gold">
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-muted mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Address */}
          {address && (
            <div className="border-t border-charcoal/10 pt-12 text-center">
              <h2 className="font-display text-2xl font-semibold text-charcoal mb-4">
                {address.title}
              </h2>
              <p className="text-muted">{address.content}</p>
              <Link
                href="/tickets"
                className="inline-block mt-6 px-8 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors"
              >
                Book a Table
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
