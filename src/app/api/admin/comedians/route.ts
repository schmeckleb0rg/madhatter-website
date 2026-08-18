import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(200),
  bio: z.string().max(2000).optional(),
  headshot_url: z.string().url().optional().or(z.literal("")),
  social_links: z.object({
    instagram: z.string().max(500).optional(),
    website: z.string().max(500).optional(),
  }).optional(),
  featured: z.boolean().default(false),
});

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
  const { data, error } = await db.from("comedians").select("*").order("name", { ascending: true });
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
  const db = getAdminClient();
  const { data, error } = await db.from("comedians").insert({
    ...d,
    name: sanitizeText(d.name),
    bio: d.bio ? sanitizeText(d.bio) : null,
    headshot_url: d.headshot_url || null,
    social_links: d.social_links ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
