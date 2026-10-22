"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  todayViews: number;
  todayUniques: number;
  totalViews: number;
  trafficByDay: { date: string; views: number; uniques: number }[];
  topPages: { path: string; views: number; totalDuration: number; avgDuration: number }[];
  devices: { mobile: number; tablet: number; desktop: number };
  days: number;
};

function formatDuration(ms: number): string {
  if (ms <= 0) return "---";
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

function formatDate(dateStr: string, short?: boolean): string {
  const d = new Date(dateStr + "T00:00:00");
  if (short) return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AnalyticsChart() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(30);
  const [topPagesOpen, setTopPagesOpen] = useState(false);

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
  const days = data.trafficByDay;

  // Y-axis tick values (3-4 ticks)
  const yTicks: number[] = [];
  if (maxViews <= 4) {
    for (let i = 0; i <= maxViews; i++) yTicks.push(i);
  } else {
    const step = Math.ceil(maxViews / 4);
    for (let i = 0; i <= maxViews; i += step) yTicks.push(i);
    if (yTicks[yTicks.length - 1] < maxViews) yTicks.push(maxViews);
  }

  // X-axis labels — show ~5-7 evenly spaced dates
  const labelInterval = Math.max(1, Math.floor(days.length / 6));

  // Chart dimensions
  const chartLeft = 40;
  const chartRight = 10;
  const chartTop = 5;
  const chartBottom = 20;
  const svgWidth = 600;
  const svgHeight = 160;
  const plotWidth = svgWidth - chartLeft - chartRight;
  const plotHeight = svgHeight - chartTop - chartBottom;
  const barWidth = Math.max(3, Math.min(12, Math.floor(plotWidth / Math.max(days.length, 1)) - 2));

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

      {/* Traffic chart with axes */}
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

        {days.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No traffic data yet</p>
        ) : (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ height: "180px" }}>
            {/* Y-axis grid lines and labels */}
            {yTicks.map(tick => {
              const y = chartTop + plotHeight - (tick / maxViews) * plotHeight;
              return (
                <g key={`y-${tick}`}>
                  <line x1={chartLeft} y1={y} x2={svgWidth - chartRight} y2={y} stroke="#E5E2DA" strokeWidth={0.5} />
                  <text x={chartLeft - 6} y={y + 3} textAnchor="end" fill="#6E6759" fontSize={9} fontFamily="monospace">
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {days.map((day, i) => {
              const barSpacing = plotWidth / days.length;
              const x = chartLeft + i * barSpacing + (barSpacing - barWidth) / 2;
              const h = Math.max(1, (day.views / maxViews) * plotHeight);
              const y = chartTop + plotHeight - h;
              return (
                <rect
                  key={day.date}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  fill="#B8934A"
                  opacity={0.8}
                  rx={1}
                >
                  <title>{formatDate(day.date)}: {day.views} views, {day.uniques} unique</title>
                </rect>
              );
            })}

            {/* X-axis labels */}
            {days.map((day, i) => {
              if (i % labelInterval !== 0 && i !== days.length - 1) return null;
              const barSpacing = plotWidth / days.length;
              const x = chartLeft + i * barSpacing + barSpacing / 2;
              return (
                <text
                  key={`x-${day.date}`}
                  x={x}
                  y={svgHeight - 2}
                  textAnchor="middle"
                  fill="#6E6759"
                  fontSize={8}
                  fontFamily="monospace"
                >
                  {formatDate(day.date, true)}
                </text>
              );
            })}

            {/* Axes lines */}
            <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartTop + plotHeight} stroke="#D1CDC4" strokeWidth={1} />
            <line x1={chartLeft} y1={chartTop + plotHeight} x2={svgWidth - chartRight} y2={chartTop + plotHeight} stroke="#D1CDC4" strokeWidth={1} />
          </svg>
        )}
      </div>

      {/* Top pages — collapsible dropdown */}
      {data.topPages.length > 0 && (
        <div className="bg-white border border-charcoal/10">
          <button
            onClick={() => setTopPagesOpen(!topPagesOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-charcoal/[0.02] transition-colors"
          >
            <div className="font-mono text-xs text-muted uppercase tracking-wide">Top Pages</div>
            <svg
              className={`w-4 h-4 text-muted transition-transform ${topPagesOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {topPagesOpen && (
            <div className="border-t border-charcoal/5 px-4 sm:px-5 pb-4 sm:pb-5">
              {/* Header row */}
              <div className="flex items-center gap-2 py-2 border-b border-charcoal/5 mb-1">
                <span className="flex-1 font-mono text-[10px] text-muted uppercase">Page</span>
                <span className="w-16 text-right font-mono text-[10px] text-muted uppercase">Views</span>
                <span className="w-20 text-right font-mono text-[10px] text-muted uppercase">Total Time</span>
                <span className="w-20 text-right font-mono text-[10px] text-muted uppercase">Avg Visit</span>
              </div>

              {data.topPages.map(page => (
                <div key={page.path} className="flex items-center gap-2 py-2 border-b border-charcoal/[0.03] last:border-0">
                  <span className="flex-1 font-mono text-xs text-charcoal truncate">{page.path}</span>
                  <span className="w-16 text-right text-sm font-semibold text-charcoal">{page.views}</span>
                  <span className="w-20 text-right text-xs text-muted">{formatDuration(page.totalDuration)}</span>
                  <span className="w-20 text-right text-xs text-muted">{formatDuration(page.avgDuration)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Device breakdown — exact numbers + percentages */}
      {(data.devices.mobile + data.devices.tablet + data.devices.desktop) > 0 && (
        <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
          <div className="font-mono text-xs text-muted uppercase tracking-wide mb-3">Devices</div>
          {(() => {
            const { mobile, tablet, desktop } = data.devices;
            const total = mobile + tablet + desktop || 1;
            const pct = (n: number) => Math.round((n / total) * 100);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Mobile</span>
                  <span><span className="font-semibold text-charcoal">{mobile.toLocaleString()}</span> <span className="text-muted text-xs">({pct(mobile)}%)</span></span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Tablet</span>
                  <span><span className="font-semibold text-charcoal">{tablet.toLocaleString()}</span> <span className="text-muted text-xs">({pct(tablet)}%)</span></span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Desktop</span>
                  <span><span className="font-semibold text-charcoal">{desktop.toLocaleString()}</span> <span className="text-muted text-xs">({pct(desktop)}%)</span></span>
                </div>
                <div className="flex items-center justify-between text-sm pt-1 border-t border-charcoal/5">
                  <span className="text-muted font-medium">Total</span>
                  <span className="font-semibold text-charcoal">{total.toLocaleString()}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
