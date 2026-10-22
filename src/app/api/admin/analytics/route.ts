import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") || "30", 10) || 30, 90);

  const db = getAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: rows } = await db
    .from("pageviews")
    .select("path, duration_ms, screen_width, visitor_hash, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const pageviews = rows || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Today's stats
  const todayViews = pageviews.filter(r => r.created_at.slice(0, 10) === todayStr);
  const todayUniques = new Set(todayViews.map(r => r.visitor_hash)).size;

  // Traffic by day
  const dailyMap = new Map<string, { views: number; uniques: Set<string> }>();
  for (const row of pageviews) {
    const day = row.created_at.slice(0, 10);
    if (!dailyMap.has(day)) dailyMap.set(day, { views: 0, uniques: new Set() });
    const bucket = dailyMap.get(day)!;
    bucket.views++;
    bucket.uniques.add(row.visitor_hash);
  }
  const trafficByDay = Array.from(dailyMap.entries())
    .map(([date, { views, uniques }]) => ({ date, views, uniques: uniques.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top pages
  const pageMap = new Map<string, { views: number; totalDuration: number; durationCount: number }>();
  for (const row of pageviews) {
    if (!pageMap.has(row.path)) pageMap.set(row.path, { views: 0, totalDuration: 0, durationCount: 0 });
    const p = pageMap.get(row.path)!;
    p.views++;
    if (row.duration_ms > 0) {
      p.totalDuration += row.duration_ms;
      p.durationCount++;
    }
  }
  const topPages = Array.from(pageMap.entries())
    .map(([path, { views, totalDuration, durationCount }]) => ({
      path,
      views,
      avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Device breakdown
  let mobile = 0, tablet = 0, desktop = 0;
  for (const row of pageviews) {
    if (!row.screen_width) continue;
    if (row.screen_width < 768) mobile++;
    else if (row.screen_width < 1024) tablet++;
    else desktop++;
  }

  return NextResponse.json({
    todayViews: todayViews.length,
    todayUniques,
    totalViews: pageviews.length,
    trafficByDay,
    topPages,
    devices: { mobile, tablet, desktop },
    days,
  });
}
