import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().max(100).optional().nullable(),
  type: z.enum(["full-time", "part-time", "gig", "internship"]).default("part-time"),
  description: z.string().max(5000).optional().nullable(),
  requirements: z.string().max(5000).optional().nullable(),
  compensation: z.string().max(200).optional().nullable(),
  application_email: z.string().email().max(200).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
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
    .from("job_listings")
    .select("*")
    .order("sort_order", { ascending: true });
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
  const { data, error } = await db.from("job_listings").insert({
    title: sanitizeText(d.title),
    department: d.department ? sanitizeText(d.department) : null,
    type: d.type,
    description: d.description ? sanitizeText(d.description) : null,
    requirements: d.requirements ? sanitizeText(d.requirements) : null,
    compensation: d.compensation ? sanitizeText(d.compensation) : null,
    application_email: d.application_email || null,
    expires_at: d.expires_at || null,
    is_active: d.is_active,
    sort_order: d.sort_order,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
