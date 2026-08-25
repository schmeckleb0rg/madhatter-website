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
  id: z.string().uuid(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data, error } = await db.from("email_templates").select("*").order("template_key");
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { id, subject, body: emailBody } = parsed.data;
  const db = getAdminClient();

  const { error } = await db.from("email_templates").update({
    subject: sanitizeText(subject),
    body: sanitizeText(emailBody),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  revalidatePath("/admin/messaging");
  return NextResponse.json({ success: true });
}
