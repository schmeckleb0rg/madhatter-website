"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

type Props = {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
};

export default function CountUp({ end, duration = 1500, suffix = "", prefix = "" }: Props) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {prefix}{count}{suffix}
    </span>
  );
}
