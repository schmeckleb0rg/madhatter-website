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

  // Temporary diagnostic — remove after verifying Upstash env vars
  const envDebug = {
    hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    urlPrefix: process.env.UPSTASH_REDIS_REST_URL?.slice(0, 20) || "(empty)",
  };

  return NextResponse.json({ ...stats, _envDebug: envDebug });
}
