"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Partner = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  affiliate_link: string | null;
  distance: string | null;
  walk_time: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const PARTNER_TYPES = ["restaurant", "hotel", "bar", "parking", "attraction"] as const;

const TYPE_COLORS: Record<string, string> = {
  restaurant: "bg-amber-500/20 text-amber-300",
  hotel: "bg-blue-500/20 text-blue-300",
  bar: "bg-purple-500/20 text-purple-300",
  parking: "bg-green-500/20 text-green-300",
  attraction: "bg-rose-500/20 text-rose-300",
};

const emptyForm = {
  name: "",
  type: "restaurant" as string,
  description: "",
  image_url: "",
  link: "",
  affiliate_link: "",
  distance: "",
  walk_time: "",
  sort_order: "0",
  is_active: true,
};

export default function VisitorGuideAdmin({ initialPartners }: { initialPartners: Partner[] }) {
  const router = useRouter();
  const [partners, setPartners] = useState(initialPartners);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ ...emptyForm });
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "error">("idle");
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [editStatus, setEditStatus] = useState<"idle" | "loading">("idle");

  const inputClass = "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted-dark mb-1.5";
  const btnPrimary = "px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors";
  const btnSecondary = "px-4 py-2 border border-off-white/10 text-off-white/70 text-sm hover:text-off-white hover:border-off-white/30 transition-colors";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus("loading");
    setCreateError("");

    const res = await fetch("/api/admin/visitor-guide/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createForm.name,
        type: createForm.type,
        description: createForm.description || undefined,
        image_url: createForm.image_url || undefined,
        link: createForm.link || undefined,
        affiliate_link: createForm.affiliate_link || undefined,
        distance: createForm.distance || undefined,
        walk_time: createForm.walk_time || undefined,
        sort_order: parseInt(createForm.sort_order) || 0,
        is_active: createForm.is_active,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setCreateError(data.error ?? "Failed to create");
      setCreateStatus("error");
      return;
    }

    const newPartner = await res.json();
    setPartners([...partners, newPartner].sort((a, b) => a.sort_order - b.sort_order));
    setShowCreate(false);
    setCreateForm({ ...emptyForm });
    setCreateStatus("idle");
    router.refresh();
  }

  function startEdit(partner: Partner) {
    setEditingId(partner.id);
    setEditForm({
      name: partner.name,
      type: partner.type,
      description: partner.description ?? "",
      image_url: partner.image_url ?? "",
      link: partner.link ?? "",
      affiliate_link: partner.affiliate_link ?? "",
      distance: partner.distance ?? "",
      walk_time: partner.walk_time ?? "",
      sort_order: String(partner.sort_order),
      is_active: partner.is_active,
    });
  }

  async function handleUpdate(id: string) {
    setEditStatus("loading");

    const res = await fetch(`/api/admin/visitor-guide/partners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        type: editForm.type,
        description: editForm.description || null,
        image_url: editForm.image_url || null,
        link: editForm.link || null,
        affiliate_link: editForm.affiliate_link || null,
        distance: editForm.distance || null,
        walk_time: editForm.walk_time || null,
        sort_order: parseInt(editForm.sort_order) || 0,
        is_active: editForm.is_active,
      }),
    });

    if (res.ok) {
      setPartners(partners.map((p) =>
        p.id === id
          ? {
              ...p,
              name: editForm.name,
              type: editForm.type,
              description: editForm.description || null,
              image_url: editForm.image_url || null,
              link: editForm.link || null,
              affiliate_link: editForm.affiliate_link || null,
              distance: editForm.distance || null,
              walk_time: editForm.walk_time || null,
              sort_order: parseInt(editForm.sort_order) || 0,
              is_active: editForm.is_active,
            }
          : p
      ).sort((a, b) => a.sort_order - b.sort_order));
      setEditingId(null);
      router.refresh();
    }
    setEditStatus("idle");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this partner? This action cannot be undone.")) return;
    await fetch(`/api/admin/visitor-guide/partners/${id}`, { method: "DELETE" });
    setPartners(partners.filter((p) => p.id !== id));
    router.refresh();
  }

  function renderForm(
    form: typeof emptyForm,
    setForm: (f: typeof emptyForm) => void,
  ) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Partner name"
            />
          </div>
          <div>
            <label className={labelClass}>Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputClass}
            >
              {PARTNER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} min-h-[80px]`}
            placeholder="Brief description of this partner"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelClass}>Website Link</label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Affiliate Link</label>
            <input
              type="text"
              value={form.affiliate_link}
              onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Distance</label>
              <input
                type="text"
                value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className={inputClass}
                placeholder="0.2 miles"
              />
            </div>
            <div>
              <label className={labelClass}>Walk Time</label>
              <input
                type="text"
                value={form.walk_time}
                onChange={(e) => setForm({ ...form, walk_time: e.target.value })}
                className={inputClass}
                placeholder="5 min"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sort Order</label>
            <input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm text-off-white/70">Active</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-off-white">Visitor Guide</h1>
          <p className="text-sm text-muted-dark mt-1">
            {partners.length} partner{partners.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={btnPrimary}
        >
          + Add Partner
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white/5 border border-off-white/10 p-5 mb-6">
          <div className="font-mono text-xs uppercase tracking-widest text-gold mb-4">New Partner</div>
          {renderForm(createForm, setCreateForm)}
          {createError && <p className="text-sm text-red-400 mt-3">{createError}</p>}
          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              disabled={createStatus === "loading"}
              className={`${btnPrimary} disabled:opacity-50`}
            >
              {createStatus === "loading" ? "Creating..." : "Create Partner"}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setCreateForm({ ...emptyForm }); setCreateError(""); setCreateStatus("idle"); }}
              className={btnSecondary}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Partners List */}
      {partners.length === 0 ? (
        <div className="text-center py-20 text-muted-dark">No partners yet. Add your first one above.</div>
      ) : (
        <div className="space-y-2">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white/5 border border-off-white/10 px-5 py-4"
            >
              {editingId === partner.id ? (
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-gold mb-4">Edit Partner</div>
                  {renderForm(editForm, setEditForm)}
                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => handleUpdate(partner.id)}
                      disabled={editStatus === "loading"}
                      className={`${btnPrimary} disabled:opacity-50`}
                    >
                      {editStatus === "loading" ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className={btnSecondary}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-off-white">{partner.name}</span>
                        <span className={`font-mono text-xs px-2 py-0.5 ${TYPE_COLORS[partner.type] ?? "bg-white/10 text-off-white/60"}`}>
                          {partner.type}
                        </span>
                        {!partner.is_active && (
                          <span className="font-mono text-xs px-2 py-0.5 bg-white/10 text-off-white/40">
                            inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-dark mt-0.5 flex items-center gap-3">
                        {partner.distance && <span>{partner.distance}</span>}
                        {partner.walk_time && <span>{partner.walk_time} walk</span>}
                        {partner.description && (
                          <span className="truncate max-w-[300px]">{partner.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-xs text-muted-dark mr-2">#{partner.sort_order}</span>
                    <button
                      onClick={() => startEdit(partner)}
                      className="text-xs text-gold/70 hover:text-gold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
