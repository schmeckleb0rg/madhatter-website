import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-auth";
import { getAdminClient } from "@/lib/supabase";
import { getStripe, cancelSubscription } from "@/lib/stripe";

const isStripeConfigured = () =>
  !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_MAD_MEMBER_MONTHLY_PRICE_ID);

export async function POST(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const billing = body.billing === "annual" ? "annual" : "monthly";
    const requestedTier = body.tier === "top_hat" ? "top_hat" : "mad_member";

    const db = getAdminClient();
    const { data: member } = await db
      .from("members")
      .select("id, stripe_customer_id, tier, points_balance")
      .eq("id", session.memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Test mode: when Stripe is not configured, directly upgrade the tier
    if (!isStripeConfigured()) {
      await db
        .from("members")
        .update({
          tier: requestedTier,
          stripe_subscription_id: `test_sub_${Date.now()}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", member.id);

      // Award bonus points
      const bonusPoints = requestedTier === "top_hat" ? 500 : 250;
      await db.from("points_transactions").insert({
        member_id: member.id,
        points: bonusPoints,
        type: "earned",
        description: `${requestedTier === "top_hat" ? "Top Hat" : "Mad Member"} subscription bonus (test mode)`,
      });
      await db
        .from("members")
        .update({ points_balance: (member.points_balance || 0) + bonusPoints })
        .eq("id", member.id);

      return NextResponse.json({ url: `${origin}/membership/dashboard?subscribed=true` });
    }

    // Production mode: create Stripe checkout session
    if (!member.stripe_customer_id) {
      return NextResponse.json({ error: "Stripe customer not found." }, { status: 400 });
    }

    let priceKey: string | undefined;
    if (requestedTier === "top_hat") {
      priceKey = billing === "annual"
        ? process.env.STRIPE_TOP_HAT_ANNUAL_PRICE_ID
        : process.env.STRIPE_TOP_HAT_MONTHLY_PRICE_ID;
    } else {
      priceKey = billing === "annual"
        ? process.env.STRIPE_MAD_MEMBER_ANNUAL_PRICE_ID
        : process.env.STRIPE_MAD_MEMBER_MONTHLY_PRICE_ID;
    }

    if (!priceKey) {
      return NextResponse.json({ error: "Stripe prices not configured." }, { status: 500 });
    }

    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: member.stripe_customer_id,
      mode: "subscription",
      line_items: [{ price: priceKey, quantity: 1 }],
      success_url: `${origin}/membership/dashboard?subscribed=true`,
      cancel_url: `${origin}/membership`,
      metadata: {
        member_id: member.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getMemberSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const db = getAdminClient();
    const { data: member } = await db
      .from("members")
      .select("stripe_subscription_id")
      .eq("id", session.memberId)
      .single();

    if (!member?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription." }, { status: 400 });
    }

    // Test mode: if subscription ID starts with test_, just downgrade directly
    if (member.stripe_subscription_id.startsWith("test_sub_")) {
      await db
        .from("members")
        .update({
          tier: "free",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.memberId);

      return NextResponse.json({ success: true });
    }

    // Production mode: cancel via Stripe
    await cancelSubscription(member.stripe_subscription_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel." }, { status: 500 });
  }
}
