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

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data } = await db.from("visitor_guide_partners").select("*").order("sort_order", { ascending: true });
  return NextResponse.json(data ?? []);
}

const partnerSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["restaurant", "hotel", "bar", "parking", "attraction"]),
  description: z.string().max(1000).optional(),
  image_url: z.string().max(500).optional(),
  link: z.string().max(500).optional(),
  affiliate_link: z.string().max(500).optional(),
  distance: z.string().max(100).optional(),
  walk_time: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();

  const { data, error } = await db.from("visitor_guide_partners").insert({
    name: sanitizeText(d.name),
    type: d.type,
    description: d.description ? sanitizeText(d.description) : null,
    image_url: d.image_url ?? null,
    link: d.link ?? null,
    affiliate_link: d.affiliate_link ?? null,
    distance: d.distance ? sanitizeText(d.distance) : null,
    walk_time: d.walk_time ? sanitizeText(d.walk_time) : null,
    sort_order: d.sort_order ?? 0,
    is_active: d.is_active ?? true,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  revalidatePath("/admin/visitor-guide");
  return NextResponse.json(data, { status: 201 });
}
