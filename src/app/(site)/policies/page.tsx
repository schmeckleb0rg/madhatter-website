import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Reveal from "@/components/Reveal";

export const revalidate = 300;

export const metadata = {
  title: "Policies & Procedures | Mad Hatter Comedy Club",
  description:
    "Venue policies, ticket terms, code of conduct, and accessibility information for Mad Hatter Comedy Club.",
};

type PolicySection = {
  id: string;
  section: string;
  content: string;
  sort_order: number;
};

async function getPolicySections(): Promise<PolicySection[]> {
  const { data } = await supabase
    .from("page_content")
    .select("id, section, content, sort_order")
    .eq("page", "policies")
    .order("sort_order", { ascending: true });
  return (data as PolicySection[]) ?? [];
}

const defaultPolicies = [
  {
    title: "Tickets & Reservations",
    items: [
      "All ticket sales are final — no refunds or exchanges.",
      "Arrive 15–30 minutes before showtime to claim your seats.",
      "Seating is first-come, first-served unless otherwise noted.",
      "Late arrivals may be seated at the host's discretion.",
    ],
  },
  {
    title: "Age Policy",
    items: [
      "Most shows are 21+ with valid ID required at the door.",
      "Select matinee and special shows may be 18+ or all-ages — check the event listing.",
      "No exceptions — forgot your ID means no entry.",
    ],
  },
  {
    title: "Food & Drink",
    items: [
      "Full bar available with craft cocktails, beer, and wine.",
      "There is a two-drink minimum per person.",
      "Outside food and beverages are not permitted.",
    ],
  },
  {
    title: "During the Show",
    items: [
      "Phones must be silenced during performances.",
      "No photography, recording, or live-streaming during shows.",
      "Heckling is not tolerated — comedians set the tone, not the audience.",
      "Management reserves the right to remove disruptive guests without refund.",
    ],
  },
  {
    title: "Accessibility",
    items: [
      "The venue is ADA accessible with ground-level entry.",
      "Accessible seating available — please let us know when booking.",
      "Service animals are welcome.",
      "Contact us for any special accommodation needs.",
    ],
  },
  {
    title: "Dress Code",
    items: [
      "Smart casual — come as you are, just look like you tried a little.",
      "No tank tops, flip-flops, or gym attire.",
    ],
  },
  {
    title: "Private Events & Rentals",
    items: [
      "A signed rental agreement and deposit are required for all private events.",
      "Event timing and noise levels must comply with city ordinances.",
      "The venue is not responsible for personal items left on the premises.",
    ],
  },
];

export default async function PoliciesPage() {
  const sections = await getPolicySections();
  const hasDbContent = sections.length > 0;

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Know Before You Go
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Policies &</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Procedures</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">House Rules</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {hasDbContent ? (
          <div className="space-y-6">
            {sections.map((section, i) => (
              <Reveal key={section.id} delay={100 + i * 50}>
                <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6">
                  <h2 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mb-3">
                    {section.section}
                  </h2>
                  <div
                    className="text-sm text-muted dark:text-[#C4BDA8] leading-relaxed prose-sm prose-li:my-0.5"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {defaultPolicies.map((section, i) => (
              <Reveal key={section.title} delay={100 + i * 50}>
                <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6">
                  <h2 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mb-3">
                    {section.title}
                  </h2>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted dark:text-[#C4BDA8]">
                        <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal delay={500}>
          <div className="text-center mt-12">
            <p className="text-muted dark:text-[#7A7264] text-sm mb-4">
              Have a question not covered here?
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors dark:bg-gold dark:text-[#0D0C0A] btn-shimmer"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
