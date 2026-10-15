import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Reveal from "@/components/Reveal";

export const revalidate = 300;

export const metadata = {
  title: "Membership | Mad Hatter Comedy Club",
  description:
    "Join the Mad Hatter Comedy Club loyalty program. Earn points, get discounts, and enjoy exclusive perks.",
};

type Tier = {
  id: string;
  name: string;
  slug: string;
  price_monthly_cents: number;
  price_annual_cents: number;
  perks: string[];
  sort_order: number;
};

async function getTiers(): Promise<Tier[]> {
  const { data } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Tier[]) ?? [];
}

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default async function MembershipPage() {
  const tiers = await getTiers();

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Join The Club
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Mad Hatter</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Membership</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Loyalty Program</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
            <p className="text-muted dark:text-[#7A7264] text-sm mt-6 max-w-xl mx-auto">
              Earn points on every purchase, unlock exclusive perks, and get closer to the comedy you love.
            </p>
          </div>
        </Reveal>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, i) => {
            const isFeatured = tier.slug === "mad-member";
            return (
              <Reveal key={tier.id} delay={100 + i * 100} direction="card">
                <div
                  className={`relative flex flex-col h-full border p-6 sm:p-8 transition-colors ${
                    isFeatured
                      ? "bg-charcoal dark:bg-[#1C1A16] border-gold text-off-white"
                      : "bg-white dark:bg-[#1C1A16] border-charcoal/10 dark:border-gold/10"
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-charcoal text-[10px] font-mono uppercase tracking-widest px-3 py-1">
                      Most Popular
                    </div>
                  )}

                  <h3
                    className={`font-display text-xl font-semibold mb-1 ${
                      isFeatured ? "text-gold" : "text-charcoal dark:text-[#F0ECE3]"
                    }`}
                  >
                    {tier.name}
                  </h3>

                  <div className="mb-6">
                    {tier.price_monthly_cents === 0 ? (
                      <span className={`text-3xl font-display font-bold ${isFeatured ? "text-off-white" : "text-charcoal dark:text-[#F0ECE3]"}`}>
                        Free
                      </span>
                    ) : (
                      <div>
                        <span className={`text-3xl font-display font-bold ${isFeatured ? "text-off-white" : "text-charcoal dark:text-[#F0ECE3]"}`}>
                          {formatPrice(tier.price_monthly_cents)}
                        </span>
                        <span className={`text-sm ${isFeatured ? "text-off-white/60" : "text-muted dark:text-[#7A7264]"}`}>
                          /month
                        </span>
                        <p className={`text-xs mt-1 ${isFeatured ? "text-off-white/50" : "text-muted dark:text-[#7A7264]"}`}>
                          or {formatPrice(tier.price_annual_cents)}/year (save {Math.round((1 - tier.price_annual_cents / (tier.price_monthly_cents * 12)) * 100)}%)
                        </p>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {(tier.perks as string[]).map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm">
                        <span className="text-gold mt-0.5 flex-shrink-0">&#10003;</span>
                        <span className={isFeatured ? "text-off-white/80" : "text-muted dark:text-[#C4BDA8]"}>
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/membership/join?tier=${tier.slug}`}
                    className={`block text-center py-3 text-sm font-semibold transition-colors ${
                      isFeatured
                        ? "bg-gold text-charcoal hover:bg-gold/90"
                        : "bg-charcoal text-off-white hover:bg-charcoal-2 dark:bg-gold dark:text-[#0D0C0A]"
                    }`}
                  >
                    {tier.price_monthly_cents === 0 ? "Join Free" : "Get Started"}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* How It Works */}
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Sign Up", desc: "Create your free account in under a minute." },
                { step: "02", title: "Earn Points", desc: "Get points on every ticket and merch purchase." },
                { step: "03", title: "Enjoy Perks", desc: "Redeem points, get discounts, and access exclusive events." },
              ].map((item) => (
                <div key={item.step} className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
                  <span className="font-mono text-2xl font-bold text-gold/30">{item.step}</span>
                  <h3 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mt-2 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted dark:text-[#7A7264]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Already a member? */}
        <Reveal>
          <div className="text-center mt-12">
            <p className="text-muted dark:text-[#7A7264] text-sm mb-4">Already a member?</p>
            <Link
              href="/membership/login"
              className="inline-block px-8 py-3 border border-charcoal/20 dark:border-gold/20 text-charcoal dark:text-[#F0ECE3] text-sm font-semibold hover:bg-charcoal/5 dark:hover:bg-gold/5 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
