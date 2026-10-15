import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Patron } from "@/lib/supabase";
import Reveal from "@/components/Reveal";

export const revalidate = 300;

export const metadata = {
  title: "Our Patrons | Mad Hatter Comedy Club",
  description: "Donors, VIP members, and sponsors who support Mad Hatter Comedy Club.",
};

async function getPatrons(): Promise<Patron[]> {
  const { data } = await supabase
    .from("patrons")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Patron[]) ?? [];
}

function PatronCard({ patron, index }: { patron: Patron; index: number }) {
  return (
    <Reveal delay={100 + index * 60} direction="card">
      <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 group hover:border-gold/30 transition-colors">
        <div className="flex items-start gap-4">
          {patron.logo_url && (
            <div className="w-14 h-14 relative flex-shrink-0 bg-off-white dark:bg-[#161412] border border-charcoal/5 dark:border-gold/10 overflow-hidden">
              <Image
                src={patron.logo_url}
                alt={patron.name}
                fill
                className="object-contain p-1"
                sizes="56px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] font-display">
              {patron.website_url ? (
                <a
                  href={patron.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  {patron.name}
                </a>
              ) : (
                patron.name
              )}
            </h3>
            {patron.tier && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-gold mt-0.5">
                {patron.tier}
              </p>
            )}
            {patron.description && (
              <p className="text-xs text-muted dark:text-[#C4BDA8] mt-2 leading-relaxed">
                {patron.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default async function PatronsPage() {
  const patrons = await getPatrons();

  const donors = patrons.filter((p) => p.type === "donor");
  const vips = patrons.filter((p) => p.type === "vip");
  const sponsors = patrons.filter((p) => p.type === "sponsor");

  const hasAny = patrons.length > 0;

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Thank You</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Our</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Patrons</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Supporters</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
            <p className="mt-6 text-muted dark:text-[#7A7264] max-w-xl mx-auto text-sm leading-relaxed">
              Mad Hatter Comedy Club is made possible by the generous support of our donors, VIP members, and sponsors.
            </p>
          </div>
        </Reveal>

        {hasAny ? (
          <div className="space-y-12">
            {/* Donors */}
            {donors.length > 0 && (
              <Reveal delay={100}>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-charcoal dark:text-[#F0ECE3] font-display">Donors</h2>
                    <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/15" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donors.map((p, i) => (
                      <PatronCard key={p.id} patron={p} index={i} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* VIP Members */}
            {vips.length > 0 && (
              <Reveal delay={200}>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-charcoal dark:text-[#F0ECE3] font-display">VIP Members</h2>
                    <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/15" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vips.map((p, i) => (
                      <PatronCard key={p.id} patron={p} index={i} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Sponsors */}
            {sponsors.length > 0 && (
              <Reveal delay={300}>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-charcoal dark:text-[#F0ECE3] font-display">Sponsors</h2>
                    <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/15" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsors.map((p, i) => (
                      <PatronCard key={p.id} patron={p} index={i} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        ) : (
          <Reveal delay={100}>
            <div className="text-center py-20 bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10">
              <p className="text-muted dark:text-[#7A7264]">Patron listings coming soon.</p>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
