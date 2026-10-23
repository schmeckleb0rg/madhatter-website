"use client";

import { useState, useEffect, useRef } from "react";

export default function TermsButton({ statement }: { statement?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDialog();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeDialog() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Don't render anything if no statement exists in DB
  if (!statement) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-dark/50 hover:text-muted-dark transition-colors"
      >
        Terms &amp; Conditions
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 sm:py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-dialog-title"
          ref={dialogRef}
        >
          <div className="absolute inset-0 bg-black/70 dark:bg-black/85" aria-hidden="true" />

          <div className="relative bg-off-white dark:bg-[#1C1A16] w-full sm:max-w-2xl sm:border sm:border-charcoal/10 max-h-[95vh] sm:max-h-[85vh] flex flex-col rounded-t-xl sm:rounded-none">
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden="true">
              <div className="w-10 h-1 rounded-full bg-charcoal/20 dark:bg-gold/20" />
            </div>

            <div className="sticky top-0 flex-shrink-0 bg-off-white dark:bg-[#1C1A16] border-b border-charcoal/10 dark:border-gold/10 px-6 py-4 flex items-center justify-between">
              <h2
                id="terms-dialog-title"
                className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]"
              >
                Terms &amp; Conditions
              </h2>
              <button
                onClick={closeDialog}
                className="w-8 h-8 flex items-center justify-center text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors rounded"
                aria-label="Close terms and conditions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 text-sm text-charcoal dark:text-[#C4BDA8] leading-relaxed">
              <p className="font-mono text-xs tracking-widest uppercase text-gold mb-4">
                Legal Information
              </p>
              <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-3">
                Terms &amp; Conditions
              </h2>
              <div
                className="terms-content"
                dangerouslySetInnerHTML={{ __html: statement }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .terms-content h2 {
          font-family: var(--font-display), serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1B1A17;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        html.dark .terms-content h2 {
          color: #F0ECE3;
        }
        .terms-content h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1B1A17;
          margin-top: 1.25rem;
          margin-bottom: 0.4rem;
        }
        html.dark .terms-content h3 {
          color: #F0ECE3;
        }
        .terms-content p {
          margin-bottom: 0.75rem;
        }
        .terms-content ul {
          margin-bottom: 0.75rem;
          padding-left: 1.25rem;
          list-style-type: disc;
        }
        .terms-content li {
          margin-bottom: 0.4rem;
        }
        .terms-content strong {
          color: #1B1A17;
          font-weight: 600;
        }
        html.dark .terms-content strong {
          color: #F0ECE3;
        }
      `}</style>
    </>
  );
}
