import type { VenueInfo } from "@/lib/venue";

export function LocalBusinessSchema({ venue }: { venue: VenueInfo }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ComedyClub",
    name: "Mad Hatter Comedy Club",
    description: `${venue.city}'s premier comedy club. Live stand-up, improv, and more.`,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://madhattercomedy.com",
    telephone: venue.phone,
    email: venue.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.street,
      addressLocality: venue.city,
      addressRegion: venue.state,
      postalCode: venue.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: parseFloat(venue.mapLat) || 41.8819,
      longitude: parseFloat(venue.mapLng) || -87.6318,
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "18:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "18:00", closes: "01:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "17:00", closes: "22:00" },
    ],
    priceRange: "$$",
    servesCuisine: "Bar",
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(`${venue.street} ${venue.city} ${venue.state} ${venue.zip}`)}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function EventSchema({ event }: {
  event: {
    title: string;
    description: string | null;
    performer: string | null;
    date: string;
    ticket_price: string | null;
    ticket_price_cents: number | null;
    is_sold_out: boolean;
  };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ComedyEvent",
    name: event.title,
    description: event.description || `Live comedy show at Mad Hatter Comedy Club`,
    startDate: event.date,
    location: {
      "@type": "Place",
      name: "Mad Hatter Comedy Club",
    },
    ...(event.performer && {
      performer: {
        "@type": "Person",
        name: event.performer,
      },
    }),
    ...(event.ticket_price_cents && {
      offers: {
        "@type": "Offer",
        price: (event.ticket_price_cents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: event.is_sold_out
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      },
    }),
    organizer: {
      "@type": "Organization",
      name: "Mad Hatter Comedy Club",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://madhattercomedy.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
