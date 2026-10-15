import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  outlet_name: z.string().min(1).max(200),
  headline: z.string().min(1).max(500),
  url: z.string().url(),
  publication_date: z.string().max(50).optional().nullable(),
  thumbnail_url: z.string().url().optional().or(z.literal("")).nullable(),
  featured_quote: z.string().max(1000).optional().nullable(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
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
  const { data, error } = await db
    .from("press_articles")
    .update({
      outlet_name: sanitizeText(d.outlet_name),
      headline: sanitizeText(d.headline),
      url: d.url,
      publication_date: d.publication_date || null,
      thumbnail_url: d.thumbnail_url || null,
      featured_quote: d.featured_quote ? sanitizeText(d.featured_quote) : null,
      is_featured: d.is_featured,
      sort_order: d.sort_order,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("press_articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
