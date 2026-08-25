import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { hash } from "bcryptjs";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  role: z.enum(["manager", "staff"]),
  permissions: z.record(z.boolean()).optional(),
});

async function requireManager() {
  const session = await auth();
  if (!session?.isAdmin || session.user.role !== "manager") return null;
  return session;
}

export async function GET() {
  const session = await requireManager();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("admin_users")
    .select("id, email, name, role, permissions, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await requireManager();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, role, permissions } = parsed.data;

  const db = getAdminClient();

  // Check for existing email
  const { data: existing } = await db
    .from("admin_users")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const password_hash = await hash(password, 12);

  const { data, error } = await db
    .from("admin_users")
    .insert({
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      permissions: permissions ?? {},
    })
    .select("id, email, name, role, permissions, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
