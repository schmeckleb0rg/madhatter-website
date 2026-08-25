import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const lineupItemSchema = z.object({
  name: z.string().max(200),
  role: z.string().max(100).optional(),
});

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  detailed_description: z.string().max(5000).optional(),
  performer: z.string().max(200).optional(),
  comedian_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1),
  doors_time: z.string().max(20).optional(),
  show_time: z.string().max(20).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  ticket_price: z.string().max(50).optional().nullable(),
  ticket_price_cents: z.number().int().min(0).optional().nullable(),
  ticket_capacity: z.number().int().min(0).optional().nullable(),
  lineup: z.array(lineupItemSchema).optional(),
  is_sold_out: z.boolean().default(false),
  is_featured: z.boolean().default(false),
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
    lineup: d.lineup || [],
    date: d.date,
    doors_time: d.doors_time || null,
    show_time: d.show_time || null,
    is_sold_out: d.is_sold_out,
    is_featured: d.is_featured,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

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
