import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

async function getEvent(id: string): Promise<Event | null> {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Event Not Found" };

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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: event.image_url
        ? [{ url: event.image_url, width: 800, height: 450, alt: event.title }]
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

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  // Redirect to events page — the popup handles the detail view
  // This page exists primarily for OG metadata when sharing event links
  const event = await getEvent(id);
  if (!event) redirect("/events");
  redirect(`/events?event=${id}`);
}
