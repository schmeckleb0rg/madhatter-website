"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full bg-white dark:bg-white/5 border border-charcoal/10 dark:border-off-white/10 px-4 py-3 text-sm text-charcoal dark:text-off-white placeholder:text-muted dark:placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]" />}>
      <JoinForm />
    </Suspense>
  );
}

function JoinForm() {
  const searchParams = useSearchParams();
  const selectedTier = searchParams.get("tier") || "free";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Register the member
      const res = await fetch("/api/membership/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, tier: selectedTier }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // If free tier, redirect to dashboard
      if (selectedTier === "free") {
        window.location.href = "/membership/dashboard";
        return;
      }

      // For paid tiers, create Stripe checkout
      const subRes = await fetch("/api/membership/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing }),
      });

      const subData = await subRes.json();
      if (subRes.ok && subData.url) {
        window.location.href = subData.url;
      } else {
        // Registration succeeded but subscription failed — still redirect to dashboard
        window.location.href = "/membership/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isPaid = selectedTier !== "free";

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Create Account</p>
          <h1 className="font-display text-3xl font-semibold text-charcoal dark:text-[#F0ECE3]">
            Join Mad Hatter
          </h1>
          <p className="text-sm text-muted dark:text-[#7A7264] mt-2">
            {isPaid ? `Signing up for ${selectedTier.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}` : "Create your free membership"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *" required className={inputClass} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" required className={inputClass} />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className={inputClass} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password * (min 8 characters)" required className={inputClass} />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password *" required className={inputClass} />

          {isPaid && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`flex-1 py-3 text-sm font-semibold border transition-colors ${
                  billing === "monthly"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-charcoal/10 dark:border-off-white/10 text-muted dark:text-muted-dark"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`flex-1 py-3 text-sm font-semibold border transition-colors ${
                  billing === "annual"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-charcoal/10 dark:border-off-white/10 text-muted dark:text-muted-dark"
                }`}
              >
                Annual (Save ~17%)
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-charcoal font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : isPaid ? "Continue to Payment" : "Create Free Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted dark:text-[#7A7264] mt-6">
          Already have an account?{" "}
          <Link href="/membership/login" className="text-gold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
