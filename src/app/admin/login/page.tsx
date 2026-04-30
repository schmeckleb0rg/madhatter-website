"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Incorrect password. Try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Admin Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full bg-[#0a0a0a] border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors"
          placeholder="Enter password"
        />
      </div>

      {error && <p className="text-club-red text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-club-gold text-4xl mb-3">🎩</div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            Admin Access
          </h1>
          <p className="text-xs text-gray-600 mt-2">Mad Hatter Comedy Club</p>
        </div>
        <div className="bg-club-card border border-club-border rounded-lg p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
