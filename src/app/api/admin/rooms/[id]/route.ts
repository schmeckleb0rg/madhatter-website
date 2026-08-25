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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { data, error } = await db.from("rooms").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const features = d.features
    ? d.features.split(",").map((f) => sanitizeText(f.trim())).filter(Boolean)
    : [];

  const { data, error } = await db.from("rooms").update({
    name: sanitizeText(d.name),
    slug: sanitizeText(d.slug),
    description: d.description ? sanitizeText(d.description) : null,
    features,
    capacity: d.capacity ?? null,
    image_url: d.image_url || null,
  }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  revalidatePath("/rooms");
  revalidatePath("/admin/rooms");
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("rooms").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  revalidatePath("/rooms");
  revalidatePath("/admin/rooms");
  return NextResponse.json({ success: true });
}
