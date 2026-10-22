"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageviewTracker() {
  const pathname = usePathname();
  const startTime = useRef<number>(Date.now());
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip admin routes
    if (pathname.startsWith("/admin")) return;

    // Send duration for the previous page
    if (lastPath.current && lastPath.current !== pathname) {
      sendDuration(lastPath.current, Date.now() - startTime.current);
    }

    // Record the new pageview
    startTime.current = Date.now();
    lastPath.current = pathname;

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        screenWidth: window.innerWidth,
      }),
      keepalive: true,
    }).catch(() => {});

    // Handle tab close / navigate away
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && lastPath.current) {
        sendDuration(lastPath.current, Date.now() - startTime.current);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}

function sendDuration(path: string, durationMs: number) {
  if (durationMs < 500 || durationMs > 1_800_000) return;

  const body = JSON.stringify({ path, durationMs });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics/duration",
      new Blob([body], { type: "application/json" })
    );
  } else {
    fetch("/api/analytics/duration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}
