import Link from "next/link";
import Reveal from "@/components/Reveal";
import CorporateInquiryForm from "@/components/CorporateInquiryForm";

export const metadata = {
  title: "Corporate Events | Mad Hatter Comedy Club",
  description:
    "Host your corporate event at Mad Hatter Comedy Club. Team-building, holiday parties, client entertainment, and more.",
};

const packages = [
  {
    name: "Team Night Out",
    capacity: "20-50 guests",
    includes: ["Reserved seating at a regular show", "Pre-show drinks reception", "Dedicated server"],
  },
  {
    name: "Private Show",
    capacity: "50-150 guests",
    includes: ["Exclusive show for your group", "Custom comedian lineup", "Full bar service", "AV setup included"],
  },
  {
    name: "Full Venue Buyout",
    capacity: "150-300 guests",
    includes: ["Entire venue for your event", "Multiple rooms available", "Custom entertainment", "Catering coordination", "Full production support"],
  },
];

export default function CorporateEventsPage() {
  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/event-spaces"
          className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Event Spaces
        </Link>

        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Corporate
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Corporate</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Events</span>
            </h1>
            <p className="mt-4 text-muted dark:text-[#7A7264] max-w-xl mx-auto">
              Make your next team event unforgettable. From intimate team dinners to full venue buyouts,
              we&apos;ll create a comedy experience your team will talk about for years.
            </p>
          </div>
        </Reveal>

        {/* Packages */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5"
              >
                <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3] mb-1">
                  {pkg.name}
                </h3>
                <span className="font-mono text-xs text-gold">{pkg.capacity}</span>
                <ul className="mt-3 space-y-1.5">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted dark:text-[#C4BDA8]">
                      <svg className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Inquiry Form */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-2">
              Get a Quote
            </h2>
            <p className="text-sm text-muted dark:text-[#7A7264] mb-6">
              Tell us about your event and we&apos;ll put together a custom package.
            </p>
            <CorporateInquiryForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
