import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { verifyPassword, createMemberSession } from "@/lib/member-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const db = getAdminClient();

    const { data: member, error } = await db
      .from("members")
      .select("id, email, name, tier, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !member) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, member.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createMemberSession({
      memberId: member.id,
      email: member.email,
      name: member.name,
      tier: member.tier,
    });

    return NextResponse.json({ success: true, tier: member.tier });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
