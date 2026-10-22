"use client";

import { useEffect, useState } from "react";

type UsageStats = {
  dailyCount: number;
  monthlyCount: number;
  monthlyLimit: number;
  daysRemaining: number;
  isRedisConnected: boolean;
  isFallbackMode: boolean;
};

export default function RateLimitMeter() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/rate-limit-usage");
        if (!res.ok) throw new Error();
        setStats(await res.json());
        setError(false);
      } catch {
        setError(true);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60_000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
        <div className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Rate Limit Status</div>
        <p className="text-sm text-muted">Unable to load rate limit data</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white border border-charcoal/10 p-4 sm:p-5 animate-pulse">
        <div className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Rate Limit Status</div>
        <div className="h-4 bg-charcoal/5 rounded w-full mb-2" />
        <div className="h-3 bg-charcoal/5 rounded w-1/2" />
      </div>
    );
  }

  const { dailyCount, monthlyCount, monthlyLimit, daysRemaining, isRedisConnected, isFallbackMode } = stats;
  const percentage = Math.min(100, Math.round((monthlyCount / monthlyLimit) * 100));

  // Color coding
  let barColor = "bg-emerald-500"; // Green: 0-60%
  let statusColor = "text-emerald-600";
  let statusLabel = "Healthy";

  if (percentage >= 80) {
    barColor = "bg-red-500";
    statusColor = "text-red-600";
    statusLabel = "Critical";
  } else if (percentage >= 60) {
    barColor = "bg-amber-500";
    statusColor = "text-amber-600";
    statusLabel = "Elevated";
  }

  if (isFallbackMode) {
    statusColor = "text-amber-600";
    statusLabel = "Fallback Mode";
  }

  if (!isRedisConnected) {
    statusColor = "text-muted";
    statusLabel = "Not Configured";
  }

  return (
    <div className="bg-white border border-charcoal/10 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-xs text-muted uppercase tracking-wide">Rate Limit Usage</div>
        <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
      </div>

      {!isRedisConnected ? (
        <p className="text-sm text-muted">
          Upstash Redis not configured. Using in-memory rate limiting only.
          <br />
          <span className="text-xs">Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.</span>
        </p>
      ) : (
        <>
          {/* Monthly usage bar */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-semibold text-charcoal">
                {monthlyCount.toLocaleString()} <span className="text-muted font-normal">/ {monthlyLimit.toLocaleString()}</span>
              </span>
              <span className="text-xs text-muted">{percentage}%</span>
            </div>
            <div className="h-2.5 bg-charcoal/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-muted mt-1">
              Monthly commands &middot; {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </div>
          </div>

          {/* Today's count */}
          <div className="flex items-center justify-between pt-2 border-t border-charcoal/5">
            <span className="text-xs text-muted">Today&apos;s requests</span>
            <span className="text-sm font-semibold text-charcoal">{dailyCount.toLocaleString()}</span>
          </div>

          {isFallbackMode && (
            <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 text-xs text-amber-700">
              Redis unreachable — using in-memory fallback. Site is fully operational.
            </div>
          )}
        </>
      )}
    </div>
  );
}
