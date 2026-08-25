"use client";

import { useState, useEffect } from "react";

type EmailPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EmailPopup({ isOpen, onClose }: EmailPopupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 animate-fadeIn" />

      {/* Modal — slides up from bottom on mobile */}
      <div className="relative bg-off-white w-full sm:max-w-md p-6 sm:p-10 animate-fadeInUp rounded-t-xl sm:rounded-none sm:border sm:border-charcoal/10">
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center -mt-2 mb-4">
          <div className="w-10 h-1 rounded-full bg-charcoal/20" />
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center text-muted hover:text-charcoal transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-semibold text-charcoal mb-2">
              You&apos;re on the list!
            </h3>
            <p className="text-muted text-sm">
              We&apos;ll keep you posted on upcoming shows and exclusive events.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="font-mono text-xs tracking-widest uppercase text-gold mb-2">
                Stay in the Loop
              </p>
              <h3 className="font-display text-2xl font-semibold text-charcoal">
                Get on the List
              </h3>
              <p className="text-muted text-sm mt-2">
                Be the first to know about upcoming shows, special events, and exclusive offers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />

              {errorMsg && (
                <p className="text-sm" style={{ color: "#9C4A38" }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
