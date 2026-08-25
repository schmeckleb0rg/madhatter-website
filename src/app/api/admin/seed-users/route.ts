import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { hash } from "bcryptjs";

export async function POST() {
  const db = getAdminClient();

  // Only allow seeding if no admin users exist yet
  const { count } = await db
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Admin users already exist. Seed is only for initial setup." },
      { status: 400 }
    );
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json(
      { error: "SITE_PASSWORD env var not set" },
      { status: 500 }
    );
  }

  const password_hash = await hash(sitePassword, 12);

  const { data, error } = await db.from("admin_users").insert([
    {
      name: "Ian Korer",
      email: "ian@madhattercomedy.com",
      password_hash,
      role: "manager",
      permissions: {},
    },
    {
      name: "Cody Sanderson",
      email: "cody@madhattercomedy.com",
      password_hash,
      role: "manager",
      permissions: {},
    },
  ]).select("id, email, name, role");

  if (error) {
    return NextResponse.json({ error: "Failed to seed users", details: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Admin users seeded successfully", users: data }, { status: 201 });
}
