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

const putSchema = z.object({
  page_key: z.string().min(1).max(100),
  section_key: z.string().min(1).max(100),
  content: z.string().max(5000),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data, error } = await db.from("page_content").select("*").order("page_key").order("section_key");
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { page_key, section_key, content } = parsed.data;
  const db = getAdminClient();

  const { error } = await db.from("page_content").upsert(
    {
      page_key: sanitizeText(page_key),
      section_key: sanitizeText(section_key),
      content: sanitizeText(content),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_key,section_key" }
  );

  if (error) return NextResponse.json({ error: "Save failed" }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/comedians");
  revalidatePath("/merch");
  revalidatePath("/about");
  revalidatePath("/rooms");
  revalidatePath("/contact");
  revalidatePath("/admin/content");

  return NextResponse.json({ success: true });
}
