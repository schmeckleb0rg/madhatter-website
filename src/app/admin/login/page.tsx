"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "";
  const callbackUrl =
    rawCallback.startsWith("/admin") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/admin/dashboard";

  async function handleSubmit(e: React.FormEvent) {
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
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div>
        <label className="block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
          placeholder="Enter password"
        />
      </div>

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-4 sm:mx-auto">
        <div className="text-center mb-8">
          <p className="font-display text-4xl font-semibold text-charcoal tracking-wide uppercase mb-1">
            Mad Hatter
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
