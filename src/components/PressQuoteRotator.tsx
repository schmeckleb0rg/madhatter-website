"use client";

import { useState, useEffect, useCallback } from "react";

type Quote = {
  text: string;
  outlet: string;
};

export default function PressQuoteRotator({ quotes }: { quotes: Quote[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const advance = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % quotes.length);
  }, [quotes.length]);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance, quotes.length]);

  if (quotes.length === 0) return null;

  const quote = quotes[activeIdx];

  return (
    <div className="text-center py-8 sm:py-10">
      <div className="max-w-2xl mx-auto px-4 relative min-h-[80px]">
        <blockquote className="text-lg sm:text-xl italic text-charcoal dark:text-[#F0ECE3] leading-relaxed transition-opacity duration-500">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <p className="text-gold text-xs font-semibold uppercase tracking-wider mt-3">
          &mdash; {quote.outlet}
        </p>
      </div>

      {quotes.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIdx ? "bg-gold" : "bg-charcoal/20 dark:bg-off-white/20"
              }`}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
