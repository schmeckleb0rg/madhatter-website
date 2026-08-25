import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { getVenueInfo, phoneHref, mapEmbedUrl } from "@/lib/venue";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

export const metadata = {
  title: "Contact | Mad Hatter Comedy Club",
  description: "Get in touch with Mad Hatter Comedy Club in Chicago. Private events, bookings, and general inquiries.",
};

async function getSocialLinks() {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "social_instagram",
      "social_tiktok",
      "social_facebook",
      "social_youtube",
    ]);

  const s: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    if (row.value) s[row.key] = row.value;
  });
  return s;
}

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("section_key, content")
    .eq("page_key", "contact");
  if (!data) return {};
  return Object.fromEntries(data.map((item) => [item.section_key, item.content]));
}

export default async function ContactPage() {
  const [venue, socialLinks, pageContent] = await Promise.all([
    getVenueInfo(),
    getSocialLinks(),
    getPageContent(),
  ]);

  const headerSubtitle = pageContent["subtitle"] || "Get In Touch";
  const headerTitle = pageContent["title"] || "Contact Us";
  const headerDescription =
    pageContent["description"] ||
    "Questions about shows, private events, or just want to say hello? We'd love to hear from you.";

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3 font-mono">
            {headerSubtitle}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-charcoal dark:text-[#F0ECE3] font-display">
            {headerTitle}
          </h1>
          <p className="mt-4 text-muted dark:text-[#7A7264] max-w-xl mx-auto">
            {headerDescription}
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link
            href="/private-events"
            className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center group hover:border-gold/30 transition-colors"
          >
            <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">Hosting?</div>
            <p className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] group-hover:text-gold transition-colors">
              Private Events
            </p>
          </Link>
          <Link
            href="/tickets"
            className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center group hover:border-gold/30 transition-colors"
          >
            <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">Need Help?</div>
            <p className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] group-hover:text-gold transition-colors">
              Ticket Questions
            </p>
          </Link>
          <a
            href={`mailto:${venue.merchEmail}`}
            className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center group hover:border-gold/30 transition-colors"
          >
            <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">Merch?</div>
            <p className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] group-hover:text-gold transition-colors">
              Merch Inquiries
            </p>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Location</div>
              <p className="text-muted dark:text-[#7A7264] text-sm">{venue.street}</p>
              <p className="text-muted dark:text-[#7A7264] text-sm">{venue.city}, {venue.state} {venue.zip}</p>
            </div>

            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Email</div>
              <a
                href={`mailto:${venue.email}`}
                className="text-muted dark:text-[#7A7264] text-sm hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors"
              >
                {venue.email}
              </a>
            </div>

            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Phone</div>
              <a
                href={phoneHref(venue)}
                className="text-muted dark:text-[#7A7264] text-sm hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors"
              >
                {venue.phone}
              </a>
            </div>

            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Hours</div>
              <div className="text-sm text-muted dark:text-[#7A7264] space-y-1">
                <div className="flex justify-between">
                  <span>Mon &ndash; Thu</span>
                  <span className="text-muted dark:text-[#7A7264]">{venue.hoursMon}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri &ndash; Sat</span>
                  <span className="text-muted dark:text-[#7A7264]">{venue.hoursFri}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted dark:text-[#7A7264]">{venue.hoursSun}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Private Events</div>
              <p className="text-muted dark:text-[#7A7264] text-sm">
                Hosting a birthday, corporate event, or party? We offer private show packages.
              </p>
              <Link
                href="/private-events"
                className="text-gold text-sm mt-2 inline-block hover:underline"
              >
                Learn more &rarr;
              </Link>
            </div>

            {/* Social links */}
            {Object.values(socialLinks).some(Boolean) && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6">
                <div className="text-gold text-sm font-semibold mb-3">Follow Us</div>
                <div className="flex items-center gap-4">
                  {socialLinks.social_instagram && (
                    <a href={socialLinks.social_instagram} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors" aria-label="Instagram">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  )}
                  {socialLinks.social_tiktok && (
                    <a href={socialLinks.social_tiktok} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors" aria-label="TikTok">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
                    </a>
                  )}
                  {socialLinks.social_facebook && (
                    <a href={socialLinks.social_facebook} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors" aria-label="Facebook">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {socialLinks.social_youtube && (
                    <a href={socialLinks.social_youtube} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors" aria-label="YouTube">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="mt-10">
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden">
            <iframe
              title="Mad Hatter Comedy Club Location"
              src={mapEmbedUrl(venue)}
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 dark:brightness-75 dark:invert dark:hue-rotate-180"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
