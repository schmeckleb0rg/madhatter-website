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
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-club-gold text-xs font-bold tracking-widest uppercase mb-3">
            Our Story
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {hero?.title ?? "About Mad Hatter"}
          </h1>
          {hero?.content && (
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {hero.content}
            </p>
          )}
          <div className="mt-6 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        {/* Story + Venue sections */}
        <div className="space-y-16">
          {story && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {story.title}
                </h2>
                <p className="text-gray-400 leading-relaxed">{story.content}</p>
              </div>
              <div className="bg-club-card border border-club-border rounded-lg p-8 text-center">
                <div className="text-club-gold text-6xl mb-4">🎩</div>
                <div className="text-club-gold tracking-widest opacity-40">♠ ♥ ♣ ♦</div>
              </div>
            </div>
          )}

          {venue && (
            <div className="bg-club-card border border-club-border rounded-lg p-8 sm:p-10">
              <h2
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {venue.title}
              </h2>
              <p className="text-gray-400 leading-relaxed">{venue.content}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "200", label: "Seats" },
              { value: "200+", label: "Shows Hosted" },
              { value: "Since 2015", label: "In Chicago" },
            ].map((stat) => (
              <div key={stat.label} className="bg-club-card border border-club-border rounded-lg p-6">
                <div
                  className="text-2xl sm:text-3xl font-bold text-club-gold"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Address */}
          {address && (
            <div className="border-t border-club-border pt-12 text-center">
              <h2
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {address.title}
              </h2>
              <p className="text-gray-400">{address.content}</p>
              <Link
                href="/tickets"
                className="inline-block mt-6 px-8 py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 transition-colors"
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
