import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase().trim()).optional(),
  description: z.string().max(500).optional().nullable(),
  discount_type: z.enum(["dollars_off", "percent_off", "early_access"]).optional(),
  discount_value: z.number().min(0).optional(),
  event_id: z.string().uuid().optional().nullable(),
  is_site_wide: z.boolean().optional(),
  max_uses: z.number().int().min(1).optional().nullable(),
  min_purchase_cents: z.number().int().min(0).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
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
  const { data, error } = await db.from("promo_codes").select("*").eq("id", id).single();
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

  // Check code uniqueness if code is being changed
  if (d.code) {
    const { data: existing } = await db.from("promo_codes").select("id").eq("code", d.code).neq("id", id).single();
    if (existing) {
      return NextResponse.json({ error: "A promo code with this code already exists." }, { status: 409 });
    }
  }

  const { data, error } = await db.from("promo_codes").update(d).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("promo_codes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
