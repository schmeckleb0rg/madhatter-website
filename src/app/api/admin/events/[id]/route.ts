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
  date: z.string().datetime(),
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { data, error } = await db.from("events").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();
  const { data, error } = await db
    .from("events")
    .update({
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
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
