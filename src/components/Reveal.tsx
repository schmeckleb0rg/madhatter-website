"use client";
import { useInView } from "@/hooks/useInView";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "none";
  className?: string;
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: RevealProps) {
  const { ref, inView } = useInView();

  const translate =
    direction === "up"
      ? "translate-y-6"
      : direction === "left"
      ? "translate-x-6"
      : "translate-y-0";

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${translate}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
