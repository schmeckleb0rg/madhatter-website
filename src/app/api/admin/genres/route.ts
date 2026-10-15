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
  const { data } = await db.from("event_genres").select("*").order("name", { ascending: true });
  return NextResponse.json(data ?? []);
}

const schema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = getAdminClient();
  const { data, error } = await db.from("event_genres").insert({
    name: sanitizeText(parsed.data.name),
    color: parsed.data.color,
  }).select().single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Genre already exists" }, { status: 400 });
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  revalidatePath("/events");
  return NextResponse.json(data, { status: 201 });
}
