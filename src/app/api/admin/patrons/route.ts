import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["donor", "vip", "sponsor"]),
  tier: z.string().max(100).optional().nullable(),
  logo_url: z.string().url().optional().or(z.literal("")).nullable(),
  website_url: z.string().url().optional().or(z.literal("")).nullable(),
  description: z.string().max(1000).optional().nullable(),
  sort_order: z.number().int().default(0),
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
  const { data, error } = await db
    .from("patrons")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data ?? []);
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
  const { data, error } = await db.from("patrons").insert({
    name: sanitizeText(d.name),
    type: d.type,
    tier: d.tier ? sanitizeText(d.tier) : null,
    logo_url: d.logo_url || null,
    website_url: d.website_url || null,
    description: d.description ? sanitizeText(d.description) : null,
    sort_order: d.sort_order,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
