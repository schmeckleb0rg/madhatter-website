import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { hash } from "bcryptjs";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(200).optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(["manager", "staff"]).optional(),
  permissions: z.record(z.boolean()).optional(),
});

async function requireManager() {
  const session = await auth();
  if (!session?.isAdmin || session.user.role !== "manager") return null;
  return session;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireManager();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, role, permissions } = parsed.data;
  const db = getAdminClient();

  // Check if target user exists
  const { data: targetUser } = await db
    .from("admin_users")
    .select("id, role")
    .eq("id", id)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Build update object
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) updates.name = name;
  if (email) {
    const normalized = email.toLowerCase().trim();
    // Check uniqueness
    const { data: existing } = await db
      .from("admin_users")
      .select("id")
      .eq("email", normalized)
      .neq("id", id)
      .single();
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    updates.email = normalized;
  }
  if (password) updates.password_hash = await hash(password, 12);
  if (role) updates.role = role;
  if (permissions !== undefined) updates.permissions = permissions;

  const { data, error } = await db
    .from("admin_users")
    .update(updates)
    .eq("id", id)
    .select("id, email, name, role, permissions, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireManager();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Prevent self-deletion
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const db = getAdminClient();

  const { error } = await db.from("admin_users").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
