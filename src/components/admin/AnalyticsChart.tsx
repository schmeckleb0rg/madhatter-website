"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  todayViews: number;
  todayUniques: number;
  totalViews: number;
  trafficByDay: { date: string; views: number; uniques: number }[];
  topPages: { path: string; views: number; avgDuration: number }[];
  devices: { mobile: number; tablet: number; desktop: number };
  days: number;
};

export default function AnalyticsChart() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(30);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/analytics?days=${range}`);
        if (!res.ok) throw new Error();
        setData(await res.json());
        setError(false);
      } catch {
        setError(true);
      }
    }
    fetchData();
  }, [range]);

  if (error) {
    return (
      <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
        <div className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Site Traffic</div>
        <p className="text-sm text-muted">Unable to load analytics data</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-charcoal/10 p-4 sm:p-5 animate-pulse">
        <div className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Site Traffic</div>
        <div className="h-32 bg-charcoal/5 rounded w-full mb-2" />
        <div className="h-3 bg-charcoal/5 rounded w-1/2" />
      </div>
    );
  }

  const maxViews = Math.max(...data.trafficByDay.map(d => d.views), 1);
  const barCount = data.trafficByDay.length || 1;

  return (
    <div className="space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-charcoal/10 p-4">
          <div className="text-2xl font-bold text-gold">{data.todayViews}</div>
          <div className="font-mono text-xs text-muted mt-1">Views Today</div>
        </div>
        <div className="bg-white border border-charcoal/10 p-4">
          <div className="text-2xl font-bold text-charcoal">{data.todayUniques}</div>
          <div className="font-mono text-xs text-muted mt-1">Unique Visitors</div>
        </div>
        <div className="bg-white border border-charcoal/10 p-4">
          <div className="text-2xl font-bold text-charcoal">{data.totalViews}</div>
          <div className="font-mono text-xs text-muted mt-1">Views ({data.days}d)</div>
        </div>
      </div>

      {/* Traffic chart */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-xs text-muted uppercase tracking-wide">Traffic Over Time</div>
          <div className="flex gap-1">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-2 py-0.5 text-xs font-mono transition-colors ${
                  range === d ? "bg-gold text-white" : "text-muted hover:text-charcoal"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {data.trafficByDay.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No traffic data yet</p>
        ) : (
          <svg
            viewBox={`0 0 ${barCount * 10} 100`}
            className="w-full h-32"
            preserveAspectRatio="none"
          >
            {data.trafficByDay.map((day, i) => {
              const h = Math.max(1, (day.views / maxViews) * 95);
              return (
                <rect
                  key={day.date}
                  x={i * 10 + 1}
                  y={100 - h}
                  width={8}
                  height={h}
                  fill="#B8934A"
                  opacity={0.8}
                  rx={1}
                >
                  <title>{day.date}: {day.views} views, {day.uniques} unique</title>
                </rect>
              );
            })}
          </svg>
        )}
      </div>

      {/* Top pages */}
      {data.topPages.length > 0 && (
        <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
          <div className="font-mono text-xs text-muted uppercase tracking-wide mb-3">Top Pages</div>
          <div className="space-y-2">
            {data.topPages.map(page => (
              <div key={page.path} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-charcoal truncate max-w-[60%]">{page.path}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted text-xs">
                    {page.avgDuration > 0 ? `${Math.round(page.avgDuration / 1000)}s avg` : "---"}
                  </span>
                  <span className="font-semibold text-charcoal">{page.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device breakdown */}
      {(data.devices.mobile + data.devices.tablet + data.devices.desktop) > 0 && (
        <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
          <div className="font-mono text-xs text-muted uppercase tracking-wide mb-3">Devices</div>
          {(() => {
            const total = data.devices.mobile + data.devices.tablet + data.devices.desktop || 1;
            const pct = (n: number) => Math.round((n / total) * 100);
            return (
              <div className="flex gap-6 text-sm">
                <div><span className="font-semibold">{pct(data.devices.mobile)}%</span> <span className="text-muted">Mobile</span></div>
                <div><span className="font-semibold">{pct(data.devices.tablet)}%</span> <span className="text-muted">Tablet</span></div>
                <div><span className="font-semibold">{pct(data.devices.desktop)}%</span> <span className="text-muted">Desktop</span></div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
