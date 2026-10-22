"use client";

import { useState } from "react";
import type { PromoCode } from "@/lib/supabase";

type PromoCodesAdminProps = {
  initialCodes: PromoCode[];
};

const DISCOUNT_TYPES = [
  { value: "dollars_off", label: "$ Off" },
  { value: "percent_off", label: "% Off" },
  { value: "early_access", label: "Early Access" },
] as const;

function formatDiscount(code: PromoCode): string {
  switch (code.discount_type) {
    case "dollars_off":
      return `$${Number(code.discount_value).toFixed(2)} off`;
    case "percent_off":
      return `${Number(code.discount_value)}% off`;
    case "early_access":
      return "Early Access";
    default:
      return "";
  }
}

export default function PromoCodesAdmin({ initialCodes }: PromoCodesAdminProps) {
  const [codes, setCodes] = useState<PromoCode[]>(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "dollars_off" as PromoCode["discount_type"],
    discount_value: "",
    is_site_wide: true,
    max_uses: "",
    expires_at: "",
    is_active: true,
  });

  function resetForm() {
    setForm({
      code: "",
      description: "",
      discount_type: "dollars_off",
      discount_value: "",
      is_site_wide: true,
      max_uses: "",
      expires_at: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(code: PromoCode) {
    setForm({
      code: code.code,
      description: code.description || "",
      discount_type: code.discount_type,
      discount_value: Number(code.discount_value).toString(),
      is_site_wide: code.is_site_wide,
      max_uses: code.max_uses?.toString() || "",
      expires_at: code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : "",
      is_active: code.is_active,
    });
    setEditingId(code.id);
    setShowForm(true);
  }

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      is_site_wide: form.is_site_wide,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };

    try {
      const url = editingId ? `/api/admin/promo-codes/${editingId}` : "/api/admin/promo-codes";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const saved = await res.json();
      if (editingId) {
        setCodes(codes.map((c) => (c.id === editingId ? saved : c)));
      } else {
        setCodes([saved, ...codes]);
      }
      resetForm();
    } catch {
      setError("Connection error.");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
    setCodes(codes.filter((c) => c.id !== id));
  }

  async function toggleActive(code: PromoCode) {
    const res = await fetch(`/api/admin/promo-codes/${code.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !code.is_active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCodes(codes.map((c) => (c.id === code.id ? updated : c)));
    }
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal">Promo Codes</h1>
          <p className="text-sm text-muted mt-1">Create and manage discount codes.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-charcoal text-off-white text-sm font-medium hover:bg-charcoal-2 transition-colors"
          >
            + New Code
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-charcoal/10 p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Code *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={inputClass}
                  placeholder="SUMMER20"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="flex-shrink-0 px-3 text-xs border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                placeholder="Summer sale 20% off"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as PromoCode["discount_type"] })}
                className={inputClass}
              >
                {DISCOUNT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {form.discount_type === "dollars_off" ? "Amount ($)" : form.discount_type === "percent_off" ? "Percentage" : "Value"}
              </label>
              <input
                type="number"
                min="0"
                step={form.discount_type === "dollars_off" ? "0.01" : "1"}
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className={inputClass}
                placeholder={form.discount_type === "dollars_off" ? "10.00" : "20"}
              />
            </div>
            <div>
              <label className={labelClass}>Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                className={inputClass}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Expires At</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex items-end gap-6 pb-3">
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_site_wide}
                  onChange={(e) => setForm({ ...form, is_site_wide: e.target.checked })}
                  className="accent-gold"
                />
                Site-wide
              </label>
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-gold"
                />
                Active
              </label>
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Create Code"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-charcoal/10 text-muted hover:text-charcoal transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {codes.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">No promo codes yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10">
                <th className="text-left font-mono text-xs uppercase tracking-widest text-muted py-3 px-2">Code</th>
                <th className="text-left font-mono text-xs uppercase tracking-widest text-muted py-3 px-2">Discount</th>
                <th className="text-left font-mono text-xs uppercase tracking-widest text-muted py-3 px-2">Uses</th>
                <th className="text-left font-mono text-xs uppercase tracking-widest text-muted py-3 px-2">Expires</th>
                <th className="text-left font-mono text-xs uppercase tracking-widest text-muted py-3 px-2">Status</th>
                <th className="text-right font-mono text-xs uppercase tracking-widest text-muted py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-b border-charcoal/5 hover:bg-off-white-2 transition-colors">
                  <td className="py-3 px-2">
                    <span className="font-mono font-semibold text-charcoal">{code.code}</span>
                    {code.description && (
                      <p className="text-xs text-muted mt-0.5">{code.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-muted">{formatDiscount(code)}</td>
                  <td className="py-3 px-2 font-mono text-muted">
                    {code.current_uses}{code.max_uses ? ` / ${code.max_uses}` : ""}
                  </td>
                  <td className="py-3 px-2 text-muted text-xs">
                    {code.expires_at
                      ? new Date(code.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Never"}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => toggleActive(code)}
                      className={`font-mono text-xs px-2 py-1 ${
                        code.is_active
                          ? "text-green-700 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {code.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => startEdit(code)}
                      className="text-xs text-muted hover:text-charcoal transition-colors mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
