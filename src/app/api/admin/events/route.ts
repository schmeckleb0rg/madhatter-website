import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const lineupItemSchema = z.object({
  name: z.string().max(200),
  role: z.string().max(100).optional(),
});

const customTimeSlotSchema = z.object({
  label: z.string().max(100),
  time: z.string().max(20),
});

const ticketTierSchema = z.object({
  name: z.string().max(100),
  price_cents: z.number().int().min(0),
  description: z.string().max(500).optional(),
});

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  detailed_description: z.string().max(5000).optional().nullable(),
  performer: z.string().max(200).optional().nullable(),
  comedian_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1),
  doors_time: z.string().max(20).optional().nullable(),
  show_time: z.string().max(20).optional().nullable(),
  end_time: z.string().max(50).optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  ticket_price: z.string().max(50).optional().nullable(),
  ticket_price_cents: z.number().int().min(0).optional().nullable(),
  ticket_capacity: z.number().int().min(0).optional().nullable(),
  ticket_tiers: z.array(ticketTierSchema).optional().nullable(),
  lineup: z.array(lineupItemSchema).optional(),
  is_sold_out: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_rsvp: z.boolean().default(false),
  force_just_announced: z.enum(["auto", "on", "off"]).default("auto"),
  selling_fast_override: z.enum(["auto", "on", "off"]).default("auto"),
  selling_fast_threshold: z.number().int().min(0).max(100).optional().nullable(),
  event_duration_minutes: z.number().int().min(0).optional().nullable(),
  event_category: z.string().max(50).default("general"),
  calendar_description: z.string().max(2000).optional().nullable(),
  table_preferences: z.array(z.string()).optional().nullable(),
  timezone: z.string().max(50).default("America/Chicago"),
  custom_time_slots: z.array(customTimeSlotSchema).optional().nullable(),
  slug: z.string().max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only").optional().nullable(),
  genre_ids: z.array(z.string().uuid()).optional(),
  where_to_watch_later: z.string().max(500).optional().nullable(),
  audience_etiquette: z.string().max(2000).optional().nullable(),
});

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getAdminClient();
  const { data, error } = await db.from("events").select("*").order("date", { ascending: true });
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();

  // Validate slug uniqueness
  if (d.slug) {
    const { data: existing } = await db.from("events").select("id").eq("slug", d.slug).single();
    if (existing) {
      return NextResponse.json({ error: "This URL slug is already in use by another event." }, { status: 409 });
    }
  }

  const { data, error } = await db.from("events").insert({
    title: sanitizeText(d.title),
    description: d.description ? sanitizeText(d.description) : null,
    detailed_description: d.detailed_description ? sanitizeText(d.detailed_description) : null,
    performer: d.performer ? sanitizeText(d.performer) : null,
    comedian_id: d.comedian_id || null,
    image_url: d.image_url || null,
    ticket_price: d.ticket_price ? sanitizeText(d.ticket_price) : null,
    ticket_price_cents: d.ticket_price_cents ?? null,
    ticket_capacity: d.ticket_capacity ?? null,
    ticket_tiers: d.ticket_tiers ?? [],
    lineup: d.lineup || [],
    date: d.date,
    doors_time: d.doors_time || null,
    show_time: d.show_time || null,
    end_time: d.end_time || null,
    is_sold_out: d.is_sold_out,
    is_featured: d.is_featured,
    is_rsvp: d.is_rsvp,
    force_just_announced: d.force_just_announced,
    selling_fast_override: d.selling_fast_override,
    selling_fast_threshold: d.selling_fast_threshold ?? null,
    event_duration_minutes: d.event_duration_minutes ?? null,
    event_category: d.event_category,
    calendar_description: d.calendar_description ?? null,
    table_preferences: d.table_preferences ?? null,
    timezone: d.timezone,
    custom_time_slots: d.custom_time_slots ?? [],
    slug: d.slug || null,
    where_to_watch_later: d.where_to_watch_later || null,
    audience_etiquette: d.audience_etiquette || null,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  // Handle genre assignments
  if (d.genre_ids && d.genre_ids.length > 0 && data) {
    await db.from("event_genre_assignments").insert(
      d.genre_ids.map((genre_id) => ({ event_id: data.id, genre_id }))
    );
  }

  // Auto-create draft email for new event notification
  try {
    const { data: template } = await db
      .from("email_templates")
      .select("subject, body")
      .eq("template_key", "new_event")
      .single();

    if (template && data) {
      const eventDate = new Date(d.date).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      const subject = template.subject
        .replace("{{event_title}}", d.title);
      const emailBody = template.body
        .replace(/\{\{event_title\}\}/g, d.title)
        .replace("{{event_performer}}", d.performer || "TBA")
        .replace("{{event_date}}", eventDate)
        .replace("{{event_time}}", d.show_time || "TBA")
        .replace("{{event_price}}", d.ticket_price || (d.ticket_price_cents ? `$${(d.ticket_price_cents / 100).toFixed(2)}` : "TBA"))
        .replace("{{event_description}}", d.description || "");

      await db.from("email_queue").insert({
        subject,
        body: emailBody,
        status: "draft",
        event_id: data.id,
      });
    }
  } catch {
    // Non-blocking: don't fail event creation if email draft fails
  }

  return NextResponse.json(data, { status: 201 });
}
