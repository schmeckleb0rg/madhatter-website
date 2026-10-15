import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { GalleryImage, PressArticle } from "@/lib/supabase";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Press & In The News | Mad Hatter Comedy Club",
  description: "Press coverage, media inquiries, and gallery for Mad Hatter Comedy Club in Chicago.",
};

const fallbackPress = [
  { outlet: "Chicago Tribune", quote: "One of Chicago's best-kept comedy secrets." },
  { outlet: "TimeOut Chicago", quote: "An intimate room with world-class talent." },
  { outlet: "Block Club Chicago", quote: "Where Chicago's next comedy stars are born." },
];

async function getPressArticles(): Promise<PressArticle[]> {
  const { data } = await supabase
    .from("press_articles")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as PressArticle[]) ?? [];
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  const { data } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as GalleryImage[]) ?? [];
}

export default async function PressPage() {
  const [articles, galleryImages] = await Promise.all([
    getPressArticles(),
    getGalleryImages(),
  ]);

  const featuredArticle = articles.find((a) => a.is_featured);
  const regularArticles = articles.filter((a) => !a.is_featured);
  const hasDbArticles = articles.length > 0;

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">In the Spotlight</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Press &</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">In The News</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Media</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {/* Featured Article */}
        {featuredArticle && (
          <Reveal delay={100}>
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 mb-10">
              <div className="flex flex-col sm:flex-row gap-6">
                {featuredArticle.thumbnail_url && (
                  <div className="w-full sm:w-48 h-48 sm:h-auto relative flex-shrink-0 bg-off-white dark:bg-[#161412] overflow-hidden">
                    <Image
                      src={featuredArticle.thumbnail_url}
                      alt={featuredArticle.headline}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 192px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-mono text-xs tracking-widest uppercase text-gold mb-2 block">
                    Featured Coverage
                  </span>
                  {featuredArticle.featured_quote && (
                    <blockquote className="text-lg sm:text-xl italic text-charcoal dark:text-[#F0ECE3] leading-relaxed mb-4 border-l-2 border-gold pl-4">
                      &ldquo;{featuredArticle.featured_quote}&rdquo;
                    </blockquote>
                  )}
                  <a
                    href={featuredArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-charcoal dark:text-[#F0ECE3] font-semibold hover:text-gold transition-colors"
                  >
                    {featuredArticle.headline} &rarr;
                  </a>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-gold">
                      {featuredArticle.outlet_name}
                    </span>
                    {featuredArticle.publication_date && (
                      <span className="text-xs text-muted dark:text-[#7A7264]">
                        {new Date(featuredArticle.publication_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Press Articles Grid */}
        {hasDbArticles ? (
          regularArticles.length > 0 && (
            <Reveal delay={200}>
              <div className="mb-10">
                <h2 className="text-lg font-bold text-charcoal dark:text-[#F0ECE3] mb-6 font-display">
                  As Seen In
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularArticles.map((article, i) => (
                    <Reveal key={article.id} delay={100 + i * 50} direction="card">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden group hover:border-gold/30 transition-colors"
                      >
                        {article.thumbnail_url && (
                          <div className="aspect-[16/9] relative overflow-hidden bg-off-white dark:bg-[#161412]">
                            <Image
                              src={article.thumbnail_url}
                              alt={article.headline}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <span className="font-mono text-[10px] tracking-widest uppercase text-gold mb-2 block">
                            {article.outlet_name}
                          </span>
                          <h3 className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] leading-snug group-hover:text-gold transition-colors">
                            {article.headline}
                          </h3>
                          {article.featured_quote && (
                            <p className="text-xs italic text-muted dark:text-[#7A7264] mt-2 line-clamp-2">
                              &ldquo;{article.featured_quote}&rdquo;
                            </p>
                          )}
                          {article.publication_date && (
                            <p className="text-xs text-muted dark:text-[#7A7264] mt-2">
                              {new Date(article.publication_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          )
        ) : (
          /* Fallback static quotes when DB is empty */
          <Reveal delay={200}>
            <div className="mb-10">
              <h2 className="text-lg font-bold text-charcoal dark:text-[#F0ECE3] mb-6 font-display">
                As Seen In
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {fallbackPress.map((feature) => (
                  <div
                    key={feature.outlet}
                    className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 text-center"
                  >
                    <p className="text-muted dark:text-[#C4BDA8] text-sm italic mb-3">
                      &ldquo;{feature.quote}&rdquo;
                    </p>
                    <p className="text-gold text-xs font-semibold uppercase tracking-wide">
                      &mdash; {feature.outlet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Press Kit */}
        <Reveal delay={300}>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-charcoal dark:text-[#F0ECE3] font-display">
                  Press Kit
                </h2>
                <p className="text-sm text-muted dark:text-[#7A7264] mt-1">
                  Everything you need for coverage and features.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 p-4">
                <div className="text-gold font-semibold mb-2">Venue Facts</div>
                <ul className="space-y-1 text-muted dark:text-[#C4BDA8]">
                  <li>200-seat intimate comedy venue</li>
                  <li>Located in downtown Chicago</li>
                  <li>Open since 2015</li>
                  <li>200+ shows hosted annually</li>
                  <li>Full bar with craft cocktails</li>
                </ul>
              </div>
              <div className="bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 p-4">
                <div className="text-gold font-semibold mb-2">Media Contact</div>
                <div className="space-y-2 text-muted dark:text-[#C4BDA8]">
                  <p>For press inquiries, interviews, and media passes:</p>
                  <a
                    href="mailto:press@madhattercomedy.com"
                    className="text-gold hover:underline block"
                  >
                    press@madhattercomedy.com
                  </a>
                  <p className="text-xs text-muted dark:text-[#7A7264] mt-2">
                    Please allow 48 hours for a response. Media passes subject to availability.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="text-xs text-muted dark:text-[#7A7264] bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-1.5">
                Logo files available on request
              </div>
              <div className="text-xs text-muted dark:text-[#7A7264] bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-1.5">
                High-res photos available
              </div>
              <div className="text-xs text-muted dark:text-[#7A7264] bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-1.5">
                Founder interviews welcome
              </div>
            </div>
          </div>
        </Reveal>

        {/* Gallery */}
        <Reveal delay={400}>
          <div className="mb-10">
            <h2 className="text-lg font-bold text-charcoal dark:text-[#F0ECE3] mb-6 font-display">
              Gallery
            </h2>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-[4/3] bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 overflow-hidden relative group"
                  >
                    <Image
                      src={img.image_url}
                      alt={img.caption ?? "Mad Hatter Comedy Club"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10">
                <p className="text-muted dark:text-[#7A7264] text-sm">Gallery photos coming soon.</p>
              </div>
            )}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={500}>
          <div className="text-center">
            <p className="text-muted dark:text-[#7A7264] text-sm mb-4">Want to feature Mad Hatter in your publication?</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 transition-colors dark:bg-gold dark:text-[#0D0C0A] btn-shimmer"
            >
              Get In Touch
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
