import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const schema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  features: z.string().max(2000).optional(),
  capacity: z.number().int().min(0).optional().nullable(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data, error } = await db.from("rooms").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
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

  // Parse comma-separated features into JSONB array
  const features = d.features
    ? d.features.split(",").map((f) => sanitizeText(f.trim())).filter(Boolean)
    : [];

  // Get next sort order
  const { data: existing } = await db.from("rooms").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const sortOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data, error } = await db.from("rooms").insert({
    name: sanitizeText(d.name),
    slug: sanitizeText(d.slug),
    description: d.description ? sanitizeText(d.description) : null,
    features,
    capacity: d.capacity ?? null,
    image_url: d.image_url || null,
    sort_order: sortOrder,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  revalidatePath("/rooms");
  revalidatePath("/admin/rooms");
  return NextResponse.json(data, { status: 201 });
}
