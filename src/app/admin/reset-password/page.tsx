"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: "#9C4A38" }}>
          Invalid reset link. The link may have expired or already been used.
        </p>
        <Link
          href="/admin/forgot-password"
          className="inline-block text-xs text-gold hover:text-charcoal transition-colors"
        >
          Request a New Reset Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-charcoal">Password updated successfully!</p>
        <p className="text-xs text-muted">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted">Enter your new password below.</p>

      <div>
        <label className="block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2">
          New Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="new-password"
          className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
          placeholder="Minimum 8 characters"
        />
      </div>

      <div>
        <label className="block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
          placeholder="Re-enter your password"
        />
      </div>

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
      >
        {loading ? "Resetting..." : "Reset Password"}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-4 sm:mx-auto">
        <div className="text-center mb-8">
          <p className="font-display text-4xl font-semibold text-charcoal tracking-wide uppercase mb-1">
            Mad Hatter
          </p>
          <h1 className="font-mono text-xs font-medium text-muted uppercase tracking-widest">
            Set New Password
          </h1>
        </div>
        <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
          <Suspense fallback={null}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
