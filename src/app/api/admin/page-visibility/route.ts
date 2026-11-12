import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const VALID_KEYS = [
  "page_visible_festivals",
  "page_visible_classes",
  "page_visible_staff",
  "page_visible_patrons",
  "page_visible_press",
  "page_visible_past_events",
  "page_visible_comedians",
  "page_visible_merch",
];

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getAdminClient();
  const { data } = await db
    .from("site_settings")
    .select("key, value")
    .in("key", VALID_KEYS);

  const visibility: Record<string, boolean> = {};
  for (const key of VALID_KEYS) {
    visibility[key] = true; // default visible
  }
  (data ?? []).forEach((row: { key: string; value: string }) => {
    visibility[row.key] = row.value !== "false";
  });
  return NextResponse.json(visibility);
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, boolean>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getAdminClient();
  const upserts: { key: string; value: string; updated_at: string }[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (!VALID_KEYS.includes(key)) continue;
    if (typeof value !== "boolean") continue;
    upserts.push({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    });
  }

  if (upserts.length === 0) {
    return NextResponse.json({ error: "No valid keys" }, { status: 400 });
  }

  const { error } = await db.from("site_settings").upsert(upserts);
  if (error) return NextResponse.json({ error: "Save failed" }, { status: 500 });

  // Revalidate all public pages so nav/footer update
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
