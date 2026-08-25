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
  sort_order: z.number().int().min(0).optional(),
  caption: z.string().max(500).optional().nullable(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();

  const update: Record<string, unknown> = {};
  if (d.sort_order !== undefined) update.sort_order = d.sort_order;
  if (d.caption !== undefined) update.caption = d.caption ? sanitizeText(d.caption) : null;

  const { data, error } = await db.from("event_slideshow").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/slideshow");
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("event_slideshow").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/slideshow");
  return NextResponse.json({ success: true });
}
