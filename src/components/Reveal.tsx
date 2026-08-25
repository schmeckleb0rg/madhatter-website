"use client";
import { useInView } from "@/hooks/useInView";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "none" | "scale" | "card";
  className?: string;
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: RevealProps) {
  const { ref, inView } = useInView();

  if (direction === "card") {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`${inView ? "animate-card-entrance" : "opacity-0"} ${className}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  }

  const hidden =
    direction === "up"
      ? "opacity-0 translate-y-6"
      : direction === "left"
      ? "opacity-0 translate-x-6"
      : direction === "scale"
      ? "opacity-0 scale-[0.95]"
      : "opacity-0";

  const visible =
    direction === "scale"
      ? "opacity-100 scale-100"
      : "opacity-100 translate-y-0 translate-x-0";

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out ${
        inView ? visible : hidden
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
