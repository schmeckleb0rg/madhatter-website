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
    "/tickets",
    "/about",
    "/contact",
    "/open-mic",
    "/classes",
    "/merch",
    "/press",
    "/visitor-info",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Dynamic event pages (ticket purchase pages)
  const { data: events } = await supabase
    .from("events")
    .select("id, created_at")
    .gte("date", new Date().toISOString());

  const eventPages = (events ?? []).map((event) => ({
    url: `${BASE_URL}/tickets/${event.id}`,
    lastModified: new Date(event.created_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...eventPages];
}
