import Link from "next/link";
import { getVenueInfo, fullAddress } from "@/lib/venue";

export const revalidate = 300;

export const metadata = {
  title: "Visitor Info & Policies | Mad Hatter Comedy Club",
  description: "Everything you need to know before visiting Mad Hatter Comedy Club — parking, age policy, accessibility, and more.",
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
    title: "Parking & Transit",
    items: [
      "Street parking available on Madison St and surrounding blocks",
      "Nearby parking garages within a 2-block walk",
      "Easily accessible via CTA Blue/Red Line — closest stop is Madison/Wabash",
      "Rideshare drop-off recommended on Madison St",
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
  {
    title: "Private Events & Groups",
    items: [
      "Groups of 10+ should contact us in advance for reserved seating",
      "Private event packages available for birthdays, corporate events, and celebrations",
    ],
  },
];

export default async function VisitorInfoPage() {
  const venue = await getVenueInfo();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">
            Before You Visit
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal font-display">
            Visitor Info & Policies
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Everything you need to know for a great night at Mad Hatter.
          </p>
        </div>

        {/* Location card */}
        <div className="bg-white border border-charcoal/10 p-6 sm:p-8 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-gold text-sm font-semibold mb-1">Address</div>
            <p className="text-muted text-sm">{fullAddress(venue)}</p>
          </div>
          <div>
            <div className="text-gold text-sm font-semibold mb-1">Box Office</div>
            <p className="text-muted text-sm">Opens 1 hour before showtime</p>
          </div>
          <div>
            <div className="text-gold text-sm font-semibold mb-1">Doors</div>
            <p className="text-muted text-sm">Open 30 min before showtime</p>
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-6">
          {policies.map((section) => (
            <div
              key={section.title}
              className="bg-white border border-charcoal/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-charcoal font-display">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted text-sm mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
