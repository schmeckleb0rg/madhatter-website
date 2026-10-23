"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  question: string;
  answer: string;
};

export default function FAQAccordion({ question, answer }: Props) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [answer]);

  // Generate a stable panel id from the question text
  const panelId = `faq-panel-${question.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40)}`;

  return (
    <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-off-white/50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] pr-4 leading-snug">
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-gold transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        ref={panelRef}
        role="region"
        aria-hidden={!open}
        style={{ maxHeight: open ? `${height}px` : "0px" }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div ref={contentRef} className="px-5 pb-4">
          <p className="text-sm text-muted dark:text-[#C4BDA8] leading-relaxed whitespace-pre-line">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
