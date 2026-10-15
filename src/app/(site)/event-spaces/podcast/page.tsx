import Link from "next/link";
import Reveal from "@/components/Reveal";
import PodcastBookingForm from "@/components/PodcastBookingForm";

export const metadata = {
  title: "Podcast Studio | Mad Hatter Comedy Club",
  description:
    "Record your podcast at Mad Hatter Comedy Club. Professional setup, club atmosphere, live audience options.",
};

const equipment = [
  "Professional condenser microphones",
  "Multi-channel audio mixer",
  "Acoustic treatment",
  "Video recording capability",
  "Comfortable seating for up to 4 guests",
  "Monitoring headphones",
  "Direct-to-USB recording",
  "Live audience option (club stage)",
];

export default function PodcastStudioPage() {
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
              Record At The Club
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Podcast</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Studio</span>
            </h1>
            <p className="mt-4 text-muted dark:text-[#7A7264] max-w-xl mx-auto">
              Record your podcast in a real comedy club. Whether you want the intimacy of our private studio
              or the energy of a live audience on our main stage — we&apos;ve got you covered.
            </p>
          </div>
        </Reveal>

        {/* Equipment */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 mb-8">
            <h2 className="font-mono text-xs tracking-widest uppercase text-gold mb-4">
              Equipment & Setup
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {equipment.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted dark:text-[#C4BDA8]">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Rates */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center">
              <div className="font-mono text-xs text-gold uppercase tracking-wider mb-2">Studio Only</div>
              <div className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                Contact for rates
              </div>
              <p className="text-xs text-muted dark:text-[#7A7264] mt-1">Private room, professional setup</p>
            </div>
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center">
              <div className="font-mono text-xs text-gold uppercase tracking-wider mb-2">Live Audience</div>
              <div className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                Contact for rates
              </div>
              <p className="text-xs text-muted dark:text-[#7A7264] mt-1">Main stage with audience</p>
            </div>
          </div>
        </Reveal>

        {/* Booking Form */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-2">
              Book Studio Time
            </h2>
            <p className="text-sm text-muted dark:text-[#7A7264] mb-6">
              Tell us about your podcast and we&apos;ll set everything up.
            </p>
            <PodcastBookingForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
