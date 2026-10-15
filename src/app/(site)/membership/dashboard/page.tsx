"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type MemberData = {
  id: string;
  name: string;
  email: string;
  tier: string;
  points_balance: number;
  stripe_subscription_id: string | null;
  created_at: string;
  recent_points: {
    id: string;
    points: number;
    type: string;
    description: string;
    created_at: string;
  }[];
};

const tierColors: Record<string, string> = {
  free: "from-zinc-500 to-zinc-700",
  "mad-member": "from-amber-600 to-yellow-500",
  "top-hat": "from-yellow-400 to-amber-300",
};

const tierLabels: Record<string, string> = {
  free: "Free Member",
  "mad-member": "Mad Member",
  "top-hat": "Top Hat VIP",
};

export default function MemberDashboard() {
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/membership/me")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/membership/login";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setMember(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/membership/logout", { method: "POST" });
    window.location.href = "/membership";
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep access until the end of your billing period.")) return;
    const res = await fetch("/api/membership/subscribe", { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    }
  }

  if (loading) {
    return (
      <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-off-white dark:bg-[#0D0C0A] flex items-center justify-center">
        <p className="text-muted dark:text-[#7A7264] text-sm">Loading...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-off-white dark:bg-[#0D0C0A] flex items-center justify-center">
        <p className="text-red-500 text-sm">{error || "Please sign in."}</p>
      </div>
    );
  }

  const gradient = tierColors[member.tier] || tierColors.free;
  const tierLabel = tierLabels[member.tier] || member.tier;

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3]">
            My Membership
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs text-muted dark:text-muted-dark hover:text-gold transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Membership Card */}
        <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 sm:p-8 mb-8 text-white shadow-lg`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Mad Hatter Comedy Club</p>
              <p className="font-display text-2xl font-bold">{member.name}</p>
              <p className="text-sm opacity-80 mt-1">{member.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest opacity-70">Tier</p>
              <p className="font-display text-lg font-semibold">{tierLabel}</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70">Points Balance</p>
              <p className="text-3xl font-display font-bold">{member.points_balance.toLocaleString()}</p>
            </div>
            <p className="text-xs opacity-50">
              Member since {new Date(member.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {member.tier === "free" && (
            <Link
              href="/membership?upgrade=true"
              className="bg-gold text-charcoal text-center py-3 text-sm font-semibold hover:bg-gold/90 transition-colors col-span-2"
            >
              Upgrade Membership
            </Link>
          )}
          <Link
            href="/events"
            className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 text-center py-3 text-sm font-medium text-charcoal dark:text-[#F0ECE3] hover:border-gold/30 transition-colors"
          >
            Browse Events
          </Link>
          <Link
            href="/merch"
            className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 text-center py-3 text-sm font-medium text-charcoal dark:text-[#F0ECE3] hover:border-gold/30 transition-colors"
          >
            Shop Merch
          </Link>
        </div>

        {/* Recent Points Activity */}
        <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6 mb-8">
          <h2 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
            Recent Points Activity
          </h2>
          {member.recent_points.length > 0 ? (
            <div className="space-y-3">
              {member.recent_points.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-charcoal dark:text-[#F0ECE3]">{tx.description}</p>
                    <p className="text-xs text-muted dark:text-[#7A7264]">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-mono font-semibold ${tx.points > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                    {tx.points > 0 ? "+" : ""}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted dark:text-[#7A7264]">
              No activity yet. Earn points by purchasing tickets or merch!
            </p>
          )}
        </div>

        {/* Subscription Management */}
        {member.stripe_subscription_id && (
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
              Subscription
            </h2>
            <p className="text-sm text-muted dark:text-[#7A7264] mb-4">
              Your {tierLabel} subscription is active.
            </p>
            <button
              onClick={handleCancelSubscription}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
