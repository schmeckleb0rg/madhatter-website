import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-auth";
import { getAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const db = getAdminClient();

    const { data: member } = await db
      .from("members")
      .select("id, name, email, tier, points_balance, stripe_subscription_id, created_at")
      .eq("id", session.memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    // Get recent points transactions
    const { data: recentPoints } = await db
      .from("points_transactions")
      .select("id, points, type, description, created_at")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      ...member,
      recent_points: recentPoints ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
