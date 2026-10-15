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

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["restaurant", "hotel", "bar", "parking", "attraction"]).optional(),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().max(500).optional().nullable(),
  link: z.string().max(500).optional().nullable(),
  affiliate_link: z.string().max(500).optional().nullable(),
  distance: z.string().max(100).optional().nullable(),
  walk_time: z.string().max(100).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(request: Request, context: RouteContext) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();
  const updates: Record<string, unknown> = {};

  if (d.name !== undefined) updates.name = sanitizeText(d.name);
  if (d.type !== undefined) updates.type = d.type;
  if (d.description !== undefined) updates.description = d.description ? sanitizeText(d.description) : null;
  if (d.image_url !== undefined) updates.image_url = d.image_url;
  if (d.link !== undefined) updates.link = d.link;
  if (d.affiliate_link !== undefined) updates.affiliate_link = d.affiliate_link;
  if (d.distance !== undefined) updates.distance = d.distance ? sanitizeText(d.distance) : null;
  if (d.walk_time !== undefined) updates.walk_time = d.walk_time ? sanitizeText(d.walk_time) : null;
  if (d.sort_order !== undefined) updates.sort_order = d.sort_order;
  if (d.is_active !== undefined) updates.is_active = d.is_active;

  const { error } = await db.from("visitor_guide_partners").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  revalidatePath("/admin/visitor-guide");
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const db = getAdminClient();

  const { error } = await db.from("visitor_guide_partners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  revalidatePath("/admin/visitor-guide");
  return NextResponse.json({ success: true });
}
