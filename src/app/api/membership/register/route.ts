import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { hashPassword, createMemberSession } from "@/lib/member-auth";
import { createCustomer } from "@/lib/stripe";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128),
  tier: z.string().default("free"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const { name, email, phone, password, tier } = parsed.data;
    const db = getAdminClient();

    // Check if email already exists
    const { data: existing } = await db
      .from("members")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Create Stripe customer for all members (needed for future upgrades)
    let stripeCustomerId: string | null = null;
    try {
      stripeCustomerId = await createCustomer(email.toLowerCase(), sanitizeText(name));
    } catch {
      // Stripe not configured — continue without it
    }

    const { data: member, error } = await db
      .from("members")
      .insert({
        name: sanitizeText(name),
        email: email.toLowerCase(),
        phone: phone ? sanitizeText(phone) : null,
        password_hash: passwordHash,
        tier: tier === "free" ? "free" : "free", // Paid tier activated after Stripe subscription
        stripe_customer_id: stripeCustomerId,
        points_balance: 0,
      })
      .select("id, email, name, tier")
      .single();

    if (error || !member) {
      return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }

    // Create session
    await createMemberSession({
      memberId: member.id,
      email: member.email,
      name: member.name,
      tier: member.tier,
    });

    // Award welcome points
    await db.from("points_transactions").insert({
      member_id: member.id,
      points: 100,
      type: "earned",
      description: "Welcome bonus",
    });

    await db
      .from("members")
      .update({ points_balance: 100 })
      .eq("id", member.id);

    return NextResponse.json({ success: true, tier: member.tier });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
