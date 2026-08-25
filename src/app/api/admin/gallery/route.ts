import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const insertSchema = z.object({
  image_url: z.string().url(),
  caption: z.string().max(500).optional(),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data } = await db.from("gallery_images").select("*").order("sort_order", { ascending: true });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = insertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { image_url, caption } = parsed.data;
  const db = getAdminClient();

  const { data: existing } = await db
    .from("gallery_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data, error } = await db.from("gallery_images").insert({
    image_url,
    caption: caption || null,
    sort_order: nextOrder,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  revalidatePath("/press");
  revalidatePath("/admin/gallery");
  return NextResponse.json(data, { status: 201 });
}
