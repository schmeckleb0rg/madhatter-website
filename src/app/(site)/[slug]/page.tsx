import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Not Found" };

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const title = `${event.title} | Mad Hatter Comedy Club`;
  const description = event.performer
    ? `${event.performer} — ${dateStr} at Mad Hatter Comedy Club`
    : `${dateStr} at Mad Hatter Comedy Club`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/${slug}`,
      images: event.image_url
        ? [{ url: event.image_url, width: 1200, height: 630, alt: event.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.image_url ? [event.image_url] : undefined,
    },
  };
}

export default async function CustomSlugPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  redirect(`/events/${event.id}`);
}
