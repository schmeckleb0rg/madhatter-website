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

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data } = await db.from("merch_items").select("*").order("sort_order", { ascending: true });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();

  let sortOrder = d.sort_order;
  if (sortOrder === undefined) {
    const { data: existing } = await db.from("merch_items").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    sortOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;
  }

  const { data, error } = await db.from("merch_items").insert({
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
    sort_order: sortOrder,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  revalidatePath("/merch");
  return NextResponse.json(data, { status: 201 });
}
