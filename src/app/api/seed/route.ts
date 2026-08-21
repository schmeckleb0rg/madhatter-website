import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  // SECURITY: Block in production — this route deletes all data
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();

  // ── Clear existing seed data first ─────────────────────────────────
  await db.from("events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("comedians").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("past_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("merch_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("gallery_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // ── Events (future dates) ──────────────────────────────────────────
  const events = [
    {
      title: "Friday Night Headliner",
      description: "Kick off the weekend with Chicago's funniest. Two hours of top-tier stand-up featuring rotating headliners and local favorites.",
      performer: "Marcus Chen",
      date: futureDate(3),
      doors_time: "7:00 PM",
      show_time: "8:00 PM",
      ticket_price: "$25",
      is_sold_out: false,
      is_featured: true,
    },
    {
      title: "Saturday Showcase",
      description: "Our flagship Saturday night show. Three comics, one unforgettable evening.",
      performer: "Jasmine Rodriguez",
      date: futureDate(4),
      doors_time: "7:30 PM",
      show_time: "8:30 PM",
      ticket_price: "$30",
      is_sold_out: false,
      is_featured: true,
    },
    {
      title: "New Faces Night",
      description: "Discover the next generation of comedy. Up-and-coming comics take the stage for their big break.",
      performer: "Various Artists",
      date: futureDate(7),
      doors_time: "7:00 PM",
      show_time: "7:30 PM",
      ticket_price: "$15",
      is_sold_out: false,
      is_featured: false,
    },
    {
      title: "Late Night Laughs",
      description: "The after-hours show where anything goes. Raw, unfiltered comedy for the night owls.",
      performer: "Devon Park",
      date: futureDate(10),
      doors_time: "10:00 PM",
      show_time: "10:30 PM",
      ticket_price: "$20",
      is_sold_out: false,
      is_featured: false,
    },
    {
      title: "Comedy & Cocktails",
      description: "Premium comedy paired with craft cocktails. An elevated evening of laughter and libations.",
      performer: "Sarah Kim",
      date: futureDate(14),
      doors_time: "6:30 PM",
      show_time: "7:30 PM",
      ticket_price: "$35",
      is_sold_out: true,
      is_featured: false,
    },
    {
      title: "Improv Jam",
      description: "Unscripted, unrehearsed, and absolutely unpredictable. Our house improv team takes your suggestions and runs with them.",
      performer: "Mad Hatter House Team",
      date: futureDate(17),
      doors_time: "7:00 PM",
      show_time: "8:00 PM",
      ticket_price: "$18",
      is_sold_out: false,
      is_featured: false,
    },
  ];

  // ── Comedians ──────────────────────────────────────────────────────
  const comedians = [
    {
      name: "Marcus Chen",
      bio: "Marcus Chen has been making audiences laugh for over a decade. Known for his razor-sharp observations and effortless crowd work, he's performed at clubs and festivals across the country. A Mad Hatter regular since day one.",
      featured: true,
      social_links: { instagram: "https://instagram.com/marcuschen" },
    },
    {
      name: "Jasmine Rodriguez",
      bio: "Jasmine Rodriguez brings warmth and wit to every set. Her storytelling style draws from her life growing up on the South Side, and she's been featured on Comedy Central and Netflix Is a Joke.",
      featured: true,
      social_links: { instagram: "https://instagram.com/jasminerodriguez" },
    },
    {
      name: "Devon Park",
      bio: "Devon Park's deadpan delivery and absurdist humor have earned him a cult following. When he's not on stage, he's writing for some of TV's sharpest comedy shows.",
      featured: false,
      social_links: { website: "https://devonpark.com" },
    },
    {
      name: "Sarah Kim",
      bio: "Sarah Kim is a rising star in the Chicago comedy scene. Her high-energy sets and fearless material have made her a crowd favorite at Mad Hatter and beyond.",
      featured: true,
      social_links: { instagram: "https://instagram.com/sarahkimcomedy" },
    },
    {
      name: "Tommy Novak",
      bio: "Tommy Novak is a Chicago comedy veteran with over 15 years on stage. His old-school storytelling style and impeccable timing make every show feel like a masterclass.",
      featured: false,
      social_links: {},
    },
  ];

  // ── Past Events ────────────────────────────────────────────────────
  const pastEvents = [
    {
      title: "Grand Opening Night",
      description: "The night it all began. A sold-out crowd welcomed Mad Hatter to the Chicago comedy scene.",
      performer: "Marcus Chen, Jasmine Rodriguez & Friends",
      date: pastDate(90),
    },
    {
      title: "Valentine's Day Special",
      description: "Love was in the air — and so were the punchlines. A romantic evening of comedy and cocktails.",
      performer: "Sarah Kim",
      date: pastDate(60),
    },
    {
      title: "April Fools Showcase",
      description: "Our biggest show of the spring. Six comics, zero seriousness.",
      performer: "Various Artists",
      date: pastDate(30),
    },
    {
      title: "Chicago Comedy Festival Kickoff",
      description: "Mad Hatter hosted the opening night of the Chicago Comedy Festival with a stacked lineup.",
      performer: "Devon Park & Tommy Novak",
      date: pastDate(14),
    },
  ];

  // ── Merch Items ────────────────────────────────────────────────────
  const merchItems = [
    {
      name: "Mad Hatter Logo Tee",
      description: "Classic black tee with the Mad Hatter logo. 100% cotton, unisex fit.",
      price_cents: 2800,
      tag: "Best Seller",
      is_active: true,
      sort_order: 1,
    },
    {
      name: "Laugh Like You Mean It Hoodie",
      description: "Heavyweight pullover hoodie with our signature tagline. Stay warm, stay funny.",
      price_cents: 5500,
      tag: "New",
      is_active: true,
      sort_order: 2,
    },
    {
      name: "Mad Hatter Dad Hat",
      description: "Embroidered logo on a classic dad hat. Adjustable strap, one size fits all.",
      price_cents: 2200,
      is_active: true,
      sort_order: 3,
    },
    {
      name: "Comedy Club Enamel Pin",
      description: "A sleek enamel pin featuring the Mad Hatter top hat. Perfect for jackets, bags, or lanyards.",
      price_cents: 1200,
      is_active: true,
      sort_order: 4,
    },
    {
      name: "Mad Hatter Pint Glass",
      description: "16oz pint glass with frosted logo. Dishwasher safe.",
      price_cents: 1500,
      tag: "Limited",
      is_active: true,
      sort_order: 5,
    },
  ];

  // ── Gallery Images (placeholder URLs) ──────────────────────────────
  const galleryImages = [
    { image_url: "https://placehold.co/800x600/1B1A17/F6F2E9?text=Show+Night", caption: "Friday Night Headliner — packed house", sort_order: 1 },
    { image_url: "https://placehold.co/800x600/1B1A17/F6F2E9?text=On+Stage", caption: "Marcus Chen on stage", sort_order: 2 },
    { image_url: "https://placehold.co/800x600/1B1A17/F6F2E9?text=The+Crowd", caption: "A full house at the Saturday Showcase", sort_order: 3 },
    { image_url: "https://placehold.co/800x600/1B1A17/F6F2E9?text=Backstage", caption: "Backstage before the show", sort_order: 4 },
    { image_url: "https://placehold.co/800x600/1B1A17/F6F2E9?text=Grand+Opening", caption: "Grand Opening Night", sort_order: 5 },
    { image_url: "https://placehold.co/800x600/1B1A17/F6F2E9?text=Open+Mic", caption: "Open mic night", sort_order: 6 },
  ];

  // ── About Content ──────────────────────────────────────────────────
  const aboutContent = [
    {
      section_key: "hero",
      title: "Chicago's Premier Comedy Club",
      content: "Mad Hatter Comedy Club is the home of live stand-up, improv, and sketch in the heart of Chicago. We've been bringing the city's best laughs since day one.",
    },
    {
      section_key: "story",
      title: "Our Story",
      content: "Mad Hatter started with a simple idea: give Chicago a comedy club that feels like home. A place where the drinks are strong, the laughs are real, and every seat in the house is a good one. What began as a small room above a bar has grown into one of the city's most beloved comedy venues — but we've never lost that intimate, anything-can-happen energy that made us special from the start.",
    },
    {
      section_key: "venue",
      title: "The Venue",
      content: "Our 120-seat showroom is designed for comedy. Intimate sightlines, a full bar, and sound that puts you right in the room with the performer. Whether you're in the front row or the back, you'll feel like part of the show.",
    },
    {
      section_key: "address",
      title: "Find Us",
      content: "123 W Madison St, Chicago, IL 60602",
    },
  ];

  // ── Insert everything ──────────────────────────────────────────────
  const results: Record<string, string> = {};

  const { error: e1 } = await db.from("events").insert(events);
  results.events = e1 ? `Error: ${e1.message}` : `${events.length} inserted`;

  const { error: e2 } = await db.from("comedians").insert(comedians);
  results.comedians = e2 ? `Error: ${e2.message}` : `${comedians.length} inserted`;

  const { error: e3 } = await db.from("past_events").insert(pastEvents);
  results.past_events = e3 ? `Error: ${e3.message}` : `${pastEvents.length} inserted`;

  const { error: e4 } = await db.from("merch_items").insert(merchItems);
  results.merch = e4 ? `Error: ${e4.message}` : `${merchItems.length} inserted`;

  const { error: e5 } = await db.from("gallery_images").insert(galleryImages);
  results.gallery = e5 ? `Error: ${e5.message}` : `${galleryImages.length} inserted`;

  // Upsert about content (may already exist from schema seed)
  const { error: e6 } = await db.from("about_content").upsert(aboutContent, { onConflict: "section_key" });
  results.about = e6 ? `Error: ${e6.message}` : `${aboutContent.length} upserted`;

  return NextResponse.json({ success: true, results });
}

// ── Helpers ────────────────────────────────────────────────────────────
function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(20, 0, 0, 0);
  return d.toISOString();
}

function pastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(20, 0, 0, 0);
  return d.toISOString();
}
