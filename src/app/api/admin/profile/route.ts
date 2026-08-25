import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { hash, compare } from "bcryptjs";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(200).optional(),
  current_password: z.string().optional(),
  new_password: z.string().min(8).max(100).optional(),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.isAdmin || !session.user.id) return null;
  return session;
}

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("admin_users")
    .select("id, email, name, role, permissions, created_at, updated_at")
    .eq("id", session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, current_password, new_password } = parsed.data;
  const db = getAdminClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (name) updates.name = name;

  if (email) {
    const normalized = email.toLowerCase().trim();
    const { data: existing } = await db
      .from("admin_users")
      .select("id")
      .eq("email", normalized)
      .neq("id", session.user.id)
      .single();
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    updates.email = normalized;
  }

  if (new_password) {
    if (!current_password) {
      return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
    }
    // Verify current password
    const { data: user } = await db
      .from("admin_users")
      .select("password_hash")
      .eq("id", session.user.id)
      .single();

    if (!user || !(await compare(current_password, user.password_hash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    updates.password_hash = await hash(new_password, 12);
  }

  const { data, error } = await db
    .from("admin_users")
    .update(updates)
    .eq("id", session.user.id)
    .select("id, email, name, role, permissions, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json(data);
}
