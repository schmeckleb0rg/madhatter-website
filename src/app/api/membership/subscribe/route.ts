import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-auth";
import { getAdminClient } from "@/lib/supabase";
import { getStripe, cancelSubscription } from "@/lib/stripe";

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
      .select("id, stripe_customer_id, tier")
      .eq("id", session.memberId)
      .single();

    if (!member || !member.stripe_customer_id) {
      return NextResponse.json({ error: "Stripe customer not found." }, { status: 400 });
    }

    // Determine the Stripe price ID based on tier and billing cycle
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
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

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

    await cancelSubscription(member.stripe_subscription_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel." }, { status: 500 });
  }
}
