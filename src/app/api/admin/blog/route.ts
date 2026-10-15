import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  body: z.string().max(50000).default(""),
  author_name: z.string().max(200).optional().nullable(),
  category: z.string().max(100).default("general"),
  publish_date: z.string().optional(),
  is_published: z.boolean().default(false),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .order("publish_date", { ascending: false });
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const slug = d.slug || generateSlug(d.title);
  const db = getAdminClient();

  const { data, error } = await db.from("blog_posts").insert({
    title: sanitizeText(d.title),
    slug,
    cover_image_url: d.cover_image_url || null,
    body: d.body,
    author_name: d.author_name ? sanitizeText(d.author_name) : null,
    category: d.category,
    publish_date: d.publish_date || new Date().toISOString(),
    is_published: d.is_published,
  }).select().single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
