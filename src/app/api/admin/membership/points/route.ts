import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  member_id: z.string().uuid(),
  points: z.number().int(),
  description: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const { member_id, points, description } = parsed.data;
    const db = getAdminClient();

    // Insert transaction
    await db.from("points_transactions").insert({
      member_id,
      points,
      type: "adjustment",
      description,
    });

    // Update balance
    const { data: member } = await db
      .from("members")
      .select("points_balance")
      .eq("id", member_id)
      .single();

    if (member) {
      await db
        .from("members")
        .update({ points_balance: Math.max(0, (member.points_balance || 0) + points) })
        .eq("id", member_id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
