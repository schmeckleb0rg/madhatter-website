import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const db = getAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const memberId = session.metadata?.member_id;
      const subscriptionId = session.subscription as string;

      if (memberId && subscriptionId) {
        // Determine tier from subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        let tier = "mad_member";
        if (
          priceId === process.env.STRIPE_TOP_HAT_MONTHLY_PRICE_ID ||
          priceId === process.env.STRIPE_TOP_HAT_ANNUAL_PRICE_ID
        ) {
          tier = "top_hat";
        }

        await db
          .from("members")
          .update({
            tier,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", memberId);

        // Award bonus points for subscribing
        const bonusPoints = tier === "top_hat" ? 500 : 250;
        await db.from("points_transactions").insert({
          member_id: memberId,
          points: bonusPoints,
          type: "earned",
          description: `${tier === "top_hat" ? "Top Hat" : "Mad Member"} subscription bonus`,
        });

        const { data: memberData } = await db
          .from("members")
          .select("points_balance")
          .eq("id", memberId)
          .single();

        if (memberData) {
          await db
            .from("members")
            .update({ points_balance: (memberData.points_balance || 0) + bonusPoints })
            .eq("id", memberId);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      // Find member by stripe customer ID and downgrade to free
      await db
        .from("members")
        .update({
          tier: "free",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_failed": {
      // Stripe handles retry logic automatically.
      // Log without exposing customer ID for privacy.
      console.warn("Stripe invoice payment failed — Stripe will retry automatically.");
      break;
    }
  }

  return NextResponse.json({ received: true });
}
