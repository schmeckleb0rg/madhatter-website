"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string;
  email: string;
  tier: string;
  points_balance: number;
  stripe_subscription_id: string | null;
  created_at: string;
};

type Tier = {
  id: string;
  name: string;
  slug: string;
  price_monthly_cents: number;
  price_annual_cents: number;
  perks: string[];
  sort_order: number;
  is_active: boolean;
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

const tierLabels: Record<string, string> = {
  free: "Free",
  "mad-member": "Mad Member",
  "top-hat": "Top Hat",
};

export default function MembershipAdmin({
  initialMembers,
  initialTiers,
}: {
  initialMembers: Member[];
  initialTiers: Tier[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [tiers] = useState(initialTiers);
  const [tab, setTab] = useState<"members" | "tiers">("members");
  const [search, setSearch] = useState("");
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  async function adjustMemberPoints(memberId: string) {
    const pts = parseInt(adjustPoints);
    if (isNaN(pts) || pts === 0) return;

    const res = await fetch(`/api/admin/membership/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        points: pts,
        description: adjustReason || "Manual adjustment",
      }),
    });

    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, points_balance: m.points_balance + pts } : m
        )
      );
      setAdjustId(null);
      setAdjustPoints("");
      setAdjustReason("");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Membership</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("members")}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === "members" ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
            }`}
          >
            Members ({members.length})
          </button>
          <button
            onClick={() => setTab("tiers")}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === "tiers" ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
            }`}
          >
            Tiers ({tiers.length})
          </button>
        </div>
      </div>

      {tab === "members" && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className={inputClass + " mb-4"}
          />

          <div className="space-y-2">
            {filteredMembers.map((m) => (
              <div key={m.id} className="bg-white/5 border border-off-white/10 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-off-white">{m.name}</span>
                    <span className="ml-2 text-xs text-muted-dark">{m.email}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 ${
                      m.tier === "top-hat"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : m.tier === "mad-member"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-white/10 text-muted-dark"
                    }`}>
                      {tierLabels[m.tier] || m.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gold font-mono">{m.points_balance} pts</span>
                    <button
                      onClick={() => setAdjustId(adjustId === m.id ? null : m.id)}
                      className="text-xs text-muted-dark hover:text-off-white transition-colors"
                    >
                      Adjust Points
                    </button>
                  </div>
                </div>

                {adjustId === m.id && (
                  <div className="mt-3 flex gap-2 items-end">
                    <input
                      type="number"
                      value={adjustPoints}
                      onChange={(e) => setAdjustPoints(e.target.value)}
                      placeholder="Points (+/-)"
                      className={inputClass + " w-32"}
                    />
                    <input
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="Reason"
                      className={inputClass + " flex-1"}
                    />
                    <button
                      onClick={() => adjustMemberPoints(m.id)}
                      className="px-3 py-2 bg-gold text-charcoal text-xs font-semibold hover:bg-gold/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <div className="mt-1 text-xs text-muted-dark">
                  Joined {new Date(m.created_at).toLocaleDateString()}
                  {m.stripe_subscription_id && " · Active subscription"}
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <p className="text-sm text-muted-dark py-4">No members found.</p>
            )}
          </div>
        </>
      )}

      {tab === "tiers" && (
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="bg-white/5 border border-off-white/10 px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-off-white">{tier.name}</h3>
                <span className="text-xs text-gold font-mono">
                  {tier.price_monthly_cents === 0
                    ? "Free"
                    : `$${(tier.price_monthly_cents / 100).toFixed(2)}/mo · $${(tier.price_annual_cents / 100).toFixed(2)}/yr`}
                </span>
              </div>
              <ul className="space-y-1">
                {(tier.perks as string[]).map((perk, i) => (
                  <li key={i} className="text-xs text-muted-dark flex items-start gap-1.5">
                    <span className="text-gold mt-0.5">&#10003;</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
