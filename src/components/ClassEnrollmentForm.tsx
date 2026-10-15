"use client";

import { useState } from "react";

type ClassEnrollmentFormProps = {
  classId: string;
  className: string;
  onClose: () => void;
};

export default function ClassEnrollmentForm({ classId, className, onClose }: ClassEnrollmentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/classes/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          name,
          email,
          phone: phone || null,
          message: message || null,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 p-5 text-center">
        <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-green-500/10 rounded-full">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-charcoal dark:text-[#F0ECE3] font-semibold text-sm">Enrollment Submitted!</p>
        <p className="text-xs text-muted dark:text-[#7A7264] mt-1">We&apos;ll be in touch about {className}.</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-2 text-sm text-charcoal dark:text-[#F0ECE3] placeholder:text-muted/50 dark:placeholder:text-[#7A7264]/50 focus:outline-none focus:border-gold/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-gold uppercase tracking-wider">Enroll in {className}</span>
        <button type="button" onClick={onClose} className="text-xs text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]">
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" className={inputClass} />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className={inputClass} />
      </div>
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className={inputClass} />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Any questions or notes?" className={inputClass} />

      {status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-2.5 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-colors disabled:opacity-50 btn-shimmer"
      >
        {status === "sending" ? "Submitting..." : "Submit Enrollment"}
      </button>
    </form>
  );
}
