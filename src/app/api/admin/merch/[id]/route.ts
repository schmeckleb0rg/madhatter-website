import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  price_cents: z.number().int().min(0),
  image_url: z.string().url().optional().or(z.literal("")),
  tag: z.string().max(50).optional().nullable(),
  category: z.enum(["apparel", "accessories"]).default("apparel"),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  is_limited: z.boolean().default(false),
  is_archive: z.boolean().default(false),
  inventory_count: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().optional(),
});

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
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
  const { data, error } = await db.from("merch_items").update({
    name: sanitizeText(d.name),
    description: d.description ? sanitizeText(d.description) : null,
    price_cents: d.price_cents,
    image_url: d.image_url || null,
    tag: d.tag ? sanitizeText(d.tag) : null,
    category: d.category,
    sizes: d.sizes || [],
    colors: d.colors || [],
    is_limited: d.is_limited,
    is_archive: d.is_archive,
    inventory_count: d.inventory_count ?? null,
    is_active: d.is_active,
    sort_order: d.sort_order,
  }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  revalidatePath("/merch");
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("merch_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  revalidatePath("/merch");
  return NextResponse.json({ success: true });
}
