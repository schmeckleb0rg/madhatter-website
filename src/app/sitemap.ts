import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://madhattercomedy.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    "",
    "/events",
    "/comedians",
    "/past-events",
    "/classes",
    "/merch",
    "/press",
    "/about",
    "/contact",
    "/visitor-info",
    "/gift-cards",
    "/gallery",
    "/blog",
    "/event-spaces",
    "/event-spaces/corporate",
    "/event-spaces/podcast",
    "/membership",
    "/staff",
    "/patrons",
    "/faqs",
    "/policies",
    "/employment",
    "/open-mic",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/events" ? 0.9 : 0.8,
  }));

  // Dynamic event pages
  const { data: events } = await supabase
    .from("events")
    .select("id, created_at")
    .gte("date", new Date().toISOString());

  const eventPages = (events ?? []).map((event) => ({
    url: `${BASE_URL}/events/${event.id}`,
    lastModified: new Date(event.created_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const ticketPages = (events ?? []).map((event) => ({
    url: `${BASE_URL}/tickets/${event.id}`,
    lastModified: new Date(event.created_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, publish_date")
    .eq("is_published", true);

  const blogPages = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publish_date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Event space detail pages
  const { data: rooms } = await supabase
    .from("rooms")
    .select("slug");

  const roomPages = (rooms ?? []).map((room) => ({
    url: `${BASE_URL}/event-spaces/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...eventPages, ...ticketPages, ...blogPages, ...roomPages];
}
