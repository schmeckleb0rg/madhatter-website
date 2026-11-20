"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-charcoal/10 p-6 sm:p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-muted hover:text-charcoal transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-mono text-xs font-medium text-muted uppercase tracking-widest mb-5">
          Reset Password
        </h2>

        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-charcoal">
              If an account exists with that email, you&apos;ll receive a password reset link shortly.
            </p>
            <p className="text-xs text-muted">Check your inbox and spam folder.</p>
            <button
              onClick={onClose}
              className="text-xs text-gold hover:text-charcoal transition-colors"
            >
              Back to Sign In
            </button>
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
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-muted hover:text-charcoal transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "";
  const callbackUrl =
    rawCallback.startsWith("/admin") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/admin/dashboard";

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Try again.");
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            id="login-email"
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

        <div>
          <label htmlFor="login-password" className="block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Enter password"
          />
        </div>

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-xs text-muted hover:text-charcoal transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p role="alert" className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-4 sm:mx-auto">
        <div className="text-center mb-8">
          <p className="font-display text-4xl font-semibold text-charcoal tracking-wide uppercase mb-1">
            MadHatter
          </p>
          <h1 className="font-mono text-xs font-medium text-muted uppercase tracking-widest">
            Admin Access
          </h1>
        </div>
        <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
