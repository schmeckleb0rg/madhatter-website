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

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function PUT(request: Request, context: RouteContext) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = getAdminClient();
  const updates: Record<string, string> = {};
  if (parsed.data.name) updates.name = sanitizeText(parsed.data.name);
  if (parsed.data.color) updates.color = parsed.data.color;

  const { error } = await db.from("event_genres").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  revalidatePath("/events");
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const db = getAdminClient();

  await db.from("event_genre_assignments").delete().eq("genre_id", id);
  const { error } = await db.from("event_genres").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  revalidatePath("/events");
  return NextResponse.json({ success: true });
}
