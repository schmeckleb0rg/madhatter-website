import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase().trim()),
  description: z.string().max(500).optional().nullable(),
  discount_type: z.enum(["dollars_off", "percent_off", "early_access"]),
  discount_value: z.number().min(0).default(0),
  event_id: z.string().uuid().optional().nullable(),
  is_site_wide: z.boolean().default(false),
  max_uses: z.number().int().min(1).optional().nullable(),
  min_purchase_cents: z.number().int().min(0).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");

  const db = getAdminClient();
  let query = db.from("promo_codes").select("*").order("created_at", { ascending: false });

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query;
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();

  // Check code uniqueness
  const { data: existing } = await db.from("promo_codes").select("id").eq("code", d.code).single();
  if (existing) {
    return NextResponse.json({ error: "A promo code with this code already exists." }, { status: 409 });
  }

  const { data, error } = await db.from("promo_codes").insert({
    code: d.code,
    description: d.description || null,
    discount_type: d.discount_type,
    discount_value: d.discount_value,
    event_id: d.event_id || null,
    is_site_wide: d.is_site_wide,
    max_uses: d.max_uses ?? null,
    min_purchase_cents: d.min_purchase_cents ?? null,
    expires_at: d.expires_at || null,
    is_active: d.is_active,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
