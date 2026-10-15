"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Patron } from "@/lib/supabase";

type Props = {
  initialPatrons: Patron[];
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

const typeLabels: Record<string, string> = {
  donor: "Donor",
  vip: "VIP Member",
  sponsor: "Sponsor",
};

export default function PatronsAdmin({ initialPatrons }: Props) {
  const router = useRouter();
  const [patrons, setPatrons] = useState(initialPatrons);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"donor" | "vip" | "sponsor">("donor");
  const [tier, setTier] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  function resetForm() {
    setName("");
    setType("donor");
    setTier("");
    setLogoUrl("");
    setWebsiteUrl("");
    setDescription("");
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
  }

  function editPatron(p: Patron) {
    setName(p.name);
    setType(p.type);
    setTier(p.tier || "");
    setLogoUrl(p.logo_url || "");
    setWebsiteUrl(p.website_url || "");
    setDescription(p.description || "");
    setSortOrder(p.sort_order);
    setEditingId(p.id);
    setShowForm(true);
  }

  async function savePatron() {
    const payload = {
      name,
      type,
      tier: tier || null,
      logo_url: logoUrl || null,
      website_url: websiteUrl || null,
      description: description || null,
      sort_order: sortOrder,
    };

    const endpoint = editingId
      ? `/api/admin/patrons/${editingId}`
      : "/api/admin/patrons";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setPatrons((prev) => prev.map((p) => (p.id === editingId ? data : p)));
      } else {
        setPatrons((prev) => [...prev, data]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deletePatron(id: string) {
    if (!confirm("Delete this patron?")) return;
    const res = await fetch(`/api/admin/patrons/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPatrons((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  const filtered = filterType === "all" ? patrons : patrons.filter((p) => p.type === filterType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Patrons</h1>
        <div className="flex items-center gap-2">
          {["all", "donor", "vip", "sponsor"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                filterType === t ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
              }`}
            >
              {t === "all" ? "All" : typeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => { resetForm(); setShowForm(true); }}
        className="mb-4 px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
      >
        + Add Patron
      </button>

      {showForm && (
        <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" className={inputClass} />
            <select value={type} onChange={(e) => setType(e.target.value as "donor" | "vip" | "sponsor")} className={inputClass}>
              <option value="donor">Donor</option>
              <option value="vip">VIP Member</option>
              <option value="sponsor">Sponsor</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={tier} onChange={(e) => setTier(e.target.value)} placeholder="Tier (e.g. Gold, Platinum)" className={inputClass} />
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Logo URL" className={inputClass} />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="Sort Order" className={inputClass} />
          </div>
          <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Website URL" className={inputClass} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className={inputClass} />
          <div className="flex gap-2">
            <button onClick={savePatron} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-white/5 border border-off-white/10 px-4 py-3">
            <div className="min-w-0">
              <span className="text-sm font-medium text-off-white">{p.name}</span>
              <span className="ml-2 text-xs text-gold">{typeLabels[p.type]}</span>
              {p.tier && <span className="ml-2 text-xs text-muted-dark">{p.tier}</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => editPatron(p)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                Edit
              </button>
              <button onClick={() => deletePatron(p.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-dark py-4">No patrons yet.</p>
        )}
      </div>
    </div>
  );
}
