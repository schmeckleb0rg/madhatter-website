import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const schema = z.object({
  seo_title: z.string().max(200).optional(),
  seo_description: z.string().max(500).optional(),
  seo_keywords: z.string().max(500).optional(),
  og_title: z.string().max(200).optional(),
  og_description: z.string().max(500).optional(),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data } = await db.from("site_settings").select("key, value");
  const settings: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = getAdminClient();
  const upserts = Object.entries(parsed.data)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({
      key,
      value: sanitizeText(value as string),
      updated_at: new Date().toISOString(),
    }));

  const { error } = await db.from("site_settings").upsert(upserts);
  if (error) return NextResponse.json({ error: "Save failed" }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/site");

  return NextResponse.json({ success: true });
}
