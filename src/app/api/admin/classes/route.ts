import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["improv", "standup", "sketch", "writing", "workshop"]).default("improv"),
  level: z.enum(["beginner", "intermediate", "advanced", "all-levels"]).default("beginner"),
  duration: z.string().max(100).optional().nullable(),
  price_cents: z.number().int().min(0).default(0),
  schedule: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  image_url: z.string().url().optional().or(z.literal("")),
  instructor: z.string().max(200).optional().nullable(),
  enrollment_status: z.enum(["open", "closed", "waitlist"]).default("open"),
  max_enrollment: z.number().int().min(0).optional().nullable(),
  cohort_start_date: z.string().optional().nullable(),
  path_order: z.number().int().min(0).default(0),
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
  const { data, error } = await db.from("classes").select("*").order("path_order", { ascending: true });
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
  const { data, error } = await db.from("classes").insert({
    title: sanitizeText(d.title),
    type: d.type,
    level: d.level,
    duration: d.duration ? sanitizeText(d.duration) : null,
    price_cents: d.price_cents,
    schedule: d.schedule ? sanitizeText(d.schedule) : null,
    description: d.description ? sanitizeText(d.description) : null,
    image_url: d.image_url || null,
    instructor: d.instructor ? sanitizeText(d.instructor) : null,
    enrollment_status: d.enrollment_status,
    max_enrollment: d.max_enrollment ?? null,
    cohort_start_date: d.cohort_start_date || null,
    path_order: d.path_order,
    is_active: d.is_active,
    sort_order: d.sort_order,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
