"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full bg-white dark:bg-white/5 border border-charcoal/10 dark:border-off-white/10 px-4 py-3 text-sm text-charcoal dark:text-off-white placeholder:text-muted dark:placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/membership/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      window.location.href = "/membership/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Welcome Back</p>
          <h1 className="font-display text-3xl font-semibold text-charcoal dark:text-[#F0ECE3]">
            Member Sign In
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={inputClass}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-charcoal font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted dark:text-[#7A7264] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/membership/join" className="text-gold hover:underline">Join now</Link>
        </p>
      </div>
    </div>
  );
}
