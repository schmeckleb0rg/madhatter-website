"use client";

type MarqueeProps = {
  items: string[];
  speed?: number;
};

export default function Marquee({ items, speed = 40 }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-charcoal/10 py-3 bg-off-white-2 select-none">
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-xs tracking-widest uppercase text-muted">
            {item}
            <span className="mx-6 text-gold">&#9670;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
