import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getVenueInfo, fullAddress } from "@/lib/venue";
import TransitChart from "@/components/TransitChart";
import PartnerCard from "@/components/PartnerCard";
import Reveal from "@/components/Reveal";

export const revalidate = 300;

export const metadata = {
  title: "Visitor Info & Policies | Mad Hatter Comedy Club",
  description:
    "Everything you need to know before visiting Mad Hatter Comedy Club — parking, transit, accessibility, nearby restaurants, and more.",
};

const policies = [
  {
    title: "Tickets & Reservations",
    items: [
      "All ticket sales are final — no refunds or exchanges",
      "Arrive 15-30 minutes before showtime to claim your seats",
      "Seating is first-come, first-served unless otherwise noted",
      "Late arrivals may be seated at the host's discretion",
    ],
  },
  {
    title: "Age Policy",
    items: [
      "Most shows are 21+ with valid ID required at the door",
      "Select matinee and special shows may be 18+ or all-ages — check the event listing",
      "No exceptions — forgot your ID means no entry",
    ],
  },
  {
    title: "Food & Drink",
    items: [
      "Full bar available with craft cocktails, beer, and wine",
      "There is a two-drink minimum per person",
      "Outside food and beverages are not permitted",
    ],
  },
  {
    title: "Accessibility",
    items: [
      "The venue is ADA accessible with ground-level entry",
      "Accessible seating available — please let us know when booking",
      "Service animals are welcome",
      "Contact us for any special accommodation needs",
    ],
  },
  {
    title: "During the Show",
    items: [
      "Phones must be silenced during performances",
      "No photography, recording, or live-streaming during shows",
      "Heckling is not tolerated — comedians set the tone, not the audience",
      "Management reserves the right to remove disruptive guests without refund",
    ],
  },
  {
    title: "Dress Code",
    items: [
      "Smart casual — come as you are, just look like you tried a little",
      "No tank tops, flip-flops, or gym attire",
    ],
  },
];

type Partner = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  distance: string | null;
  walk_time: string | null;
};

async function getPartners(): Promise<Partner[]> {
  const { data } = await supabase
    .from("visitor_guide_partners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Partner[]) ?? [];
}

async function getParkingSettings() {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["parking_map_embed_url"]);
  const settings: Record<string, string> = {};
  data?.forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export default async function VisitorInfoPage() {
  const [venue, partners, parkingSettings] = await Promise.all([
    getVenueInfo(),
    getPartners(),
    getParkingSettings(),
  ]);

  const restaurants = partners.filter((p) => p.type === "restaurant" || p.type === "bar");
  const hotels = partners.filter((p) => p.type === "hotel");
  const parkingMapUrl = parkingSettings["parking_map_embed_url"];

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Before You Visit
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Visitor</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Guide</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Plan Your Visit</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {/* Location card */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-mono text-xs text-gold uppercase tracking-wider mb-1">Address</div>
              <p className="text-sm text-charcoal dark:text-[#F0ECE3]">{fullAddress(venue)}</p>
            </div>
            <div>
              <div className="font-mono text-xs text-gold uppercase tracking-wider mb-1">Box Office</div>
              <p className="text-sm text-charcoal dark:text-[#F0ECE3]">Opens 1 hour before showtime</p>
            </div>
            <div>
              <div className="font-mono text-xs text-gold uppercase tracking-wider mb-1">Doors</div>
              <p className="text-sm text-charcoal dark:text-[#F0ECE3]">Open 30 min before showtime</p>
            </div>
          </div>
        </Reveal>

        {/* Getting Here — Transit */}
        <Reveal>
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
              Getting Here by CTA
            </h2>
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6">
              <TransitChart />
            </div>
          </div>
        </Reveal>

        {/* Parking */}
        <Reveal>
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
              Parking
            </h2>
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6">
              <ul className="space-y-2 text-sm text-muted dark:text-[#C4BDA8]">
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                  Street parking available on Madison St and surrounding blocks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                  Nearby parking garages within a 2-block walk
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                  Rideshare drop-off recommended on Madison St
                </li>
              </ul>
              {parkingMapUrl && (
                <div className="mt-4 aspect-video">
                  <iframe
                    src={parkingMapUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    title="Parking map"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Policies */}
        <Reveal>
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
              Policies
            </h2>
            <div className="space-y-4">
              {policies.map((section) => (
                <div
                  key={section.title}
                  className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6"
                >
                  <h3 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted dark:text-[#C4BDA8]">
                        <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Nearby Restaurants */}
        {restaurants.length > 0 && (
          <Reveal>
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
                Nearby Restaurants & Bars
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <Reveal>
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
                Nearby Hotels
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotels.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* CTA */}
        <Reveal>
          <div className="text-center mt-12">
            <p className="text-muted dark:text-[#7A7264] text-sm mb-4">Still have questions?</p>
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
