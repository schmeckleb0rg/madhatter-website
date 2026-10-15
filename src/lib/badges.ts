import type { Event } from "@/lib/supabase";

export function isJustAnnounced(event: Event, daysThreshold: number): boolean {
  const override = event.force_just_announced;
  if (override === "on") return true;
  if (override === "off") return false;

  const createdAt = new Date(event.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= daysThreshold;
}

export function isSellingFast(event: Event, defaultThreshold: number): boolean {
  if (event.is_sold_out) return false;

  const override = event.selling_fast_override;
  if (override === "on") return true;
  if (override === "off") return false;

  if (!event.ticket_capacity || event.ticket_capacity === 0) return false;
  if (event.tickets_sold == null) return false;

  const threshold = event.selling_fast_threshold ?? defaultThreshold;
  const percentSold = (event.tickets_sold / event.ticket_capacity) * 100;
  return percentSold >= threshold;
}
