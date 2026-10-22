import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUsageStats } from "@/lib/rate-limit";

export async function GET() {
  // Require admin authentication
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getUsageStats();
  return NextResponse.json(stats);
}
