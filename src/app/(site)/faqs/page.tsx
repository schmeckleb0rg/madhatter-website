import { supabase } from "@/lib/supabase";
import type { FAQ } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import FAQAccordion from "@/components/FAQAccordion";
import { FAQPageSchema } from "@/components/StructuredData";

export const revalidate = 300;

export const metadata = {
  title: "FAQs | Mad Hatter Comedy Club",
  description: "Frequently asked questions about Mad Hatter Comedy Club in Chicago.",
};

async function getFAQs(): Promise<FAQ[]> {
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as FAQ[]) ?? [];
}

export default async function FAQsPage() {
  const faqs = await getFAQs();

  // Group by category
  const grouped: Record<string, FAQ[]> = {};
  for (const faq of faqs) {
    const cat = faq.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(faq);
  }

  const categories = Object.keys(grouped);

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      {faqs.length > 0 && <FAQPageSchema faqs={faqs} />}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Got Questions?</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Frequently</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Asked Questions</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">FAQ</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {categories.length > 0 ? (
          <div className="space-y-10">
            {categories.map((category, catIdx) => (
              <Reveal key={category} delay={100 + catIdx * 100}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-base font-bold text-charcoal dark:text-[#F0ECE3] font-display">
                      {category}
                    </h2>
                    <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/15" />
                  </div>
                  <div className="space-y-1">
                    {grouped[category].map((faq) => (
                      <FAQAccordion key={faq.id} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={100}>
            <div className="text-center py-20 bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10">
              <p className="text-muted dark:text-[#7A7264]">FAQs coming soon.</p>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
