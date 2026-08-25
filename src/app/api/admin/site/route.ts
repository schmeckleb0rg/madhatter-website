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
  // Address & contact info
  venue_street: z.string().max(200).optional(),
  venue_city: z.string().max(100).optional(),
  venue_state: z.string().max(50).optional(),
  venue_zip: z.string().max(20).optional(),
  venue_phone: z.string().max(30).optional(),
  venue_email: z.string().max(200).optional(),
  venue_events_email: z.string().max(200).optional(),
  venue_merch_email: z.string().max(200).optional(),
  venue_map_lat: z.string().max(20).optional(),
  venue_map_lng: z.string().max(20).optional(),
  // Hours
  hours_mon_thu: z.string().max(50).optional(),
  hours_fri_sat: z.string().max(50).optional(),
  hours_sun: z.string().max(50).optional(),
  // Social media links
  social_instagram: z.string().max(500).optional(),
  social_tiktok: z.string().max(500).optional(),
  social_facebook: z.string().max(500).optional(),
  social_youtube: z.string().max(500).optional(),
  // Slideshow speed
  slideshow_speed: z.string().max(10).optional(),
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
  revalidatePath("/events");
  revalidatePath("/contact");
  revalidatePath("/visitor-info");
  revalidatePath("/about");
  revalidatePath("/rooms");
  revalidatePath("/admin/site");

  return NextResponse.json({ success: true });
}
