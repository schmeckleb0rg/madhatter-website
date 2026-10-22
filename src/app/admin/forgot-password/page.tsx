"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-4 sm:mx-auto">
        <div className="text-center mb-8">
          <p className="font-display text-4xl font-semibold text-charcoal tracking-wide uppercase mb-1">
            Mad Hatter
          </p>
          <h1 className="font-mono text-xs font-medium text-muted uppercase tracking-widest">
            Reset Password
          </h1>
        </div>
        <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-charcoal">
                If an account exists with that email, you&apos;ll receive a password reset link shortly.
              </p>
              <p className="text-xs text-muted">Check your inbox and spam folder.</p>
              <Link
                href="/admin/login"
                className="inline-block text-xs text-gold hover:text-charcoal transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-muted">
                Enter your admin email and we&apos;ll send you a link to reset your password.
              </p>
              <div>
                <label className="block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="you@madhattercomedy.com"
                />
              </div>

              {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-xs text-muted hover:text-charcoal transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
