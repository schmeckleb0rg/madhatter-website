import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data, error } = await db
    .from("subscribers")
    .select("*")
    .eq("is_active", true)
    .order("subscribed_at", { ascending: false });
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data ?? []);
}
