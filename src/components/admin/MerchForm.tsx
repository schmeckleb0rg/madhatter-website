"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MerchItem } from "@/lib/supabase";
import Image from "next/image";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export default function MerchForm({ initialData, id }: { initialData?: Partial<MerchItem>; id?: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price_cents: initialData?.price_cents?.toString() ?? "",
    image_url: initialData?.image_url ?? "",
    tag: initialData?.tag ?? "",
    category: initialData?.category ?? "apparel",
    sizes: initialData?.sizes ?? [],
    colors: Array.isArray(initialData?.colors) ? initialData.colors.join(", ") : "",
    is_limited: initialData?.is_limited ?? false,
    is_archive: initialData?.is_archive ?? false,
    inventory_count: initialData?.inventory_count?.toString() ?? "",
    is_active: initialData?.is_active ?? true,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/merch/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setForm((f) => ({ ...f, image_url: url }));
    }
    setUploading(false);
  }

  function toggleSize(size: string) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this item? This cannot be undone.")) return;
    await fetch(`/api/admin/merch/${id}`, { method: "DELETE" });
    router.push("/admin/merch");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const payload = {
      name: form.name,
      description: form.description || undefined,
      price_cents: form.price_cents ? Number(form.price_cents) : 0,
      image_url: form.image_url || "",
      tag: form.tag || null,
      category: form.category,
      sizes: form.sizes,
      colors: form.colors
        ? form.colors.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
      is_limited: form.is_limited,
      is_archive: form.is_archive,
      inventory_count: form.inventory_count ? Number(form.inventory_count) : null,
      is_active: form.is_active,
    };

    const res = await fetch(id ? `/api/admin/merch/${id}` : "/api/admin/merch", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Save failed. Check your inputs.");
      setStatus("error");
      return;
    }

    router.push("/admin/merch");
    router.refresh();
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Name <span style={{ color: "#9C4A38" }}>*</span></label>
        <input
          type="text"
          required
          maxLength={200}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          placeholder="Mad Hatter Logo Tee"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Price (cents) <span style={{ color: "#9C4A38" }}>*</span></label>
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.price_cents}
            onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
            className={inputClass}
            placeholder="3000 = $30.00"
          />
          {form.price_cents && (
            <p className="text-xs text-muted mt-1">= ${(Number(form.price_cents) / 100).toFixed(2)}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Tag</label>
          <input
            type="text"
            maxLength={50}
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            className={inputClass}
            placeholder="Best Seller, New, Limited"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={inputClass}
        >
          <option value="apparel">Apparel</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={3}
          maxLength={500}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Brief product description..."
        />
      </div>

      {/* Sizes multi-select */}
      <div>
        <label className={labelClass}>Sizes</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                form.sizes.includes(size)
                  ? "bg-charcoal text-off-white border-charcoal"
                  : "bg-off-white text-muted border-charcoal/10 hover:border-gold/40"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className={labelClass}>Colors (comma-separated)</label>
        <input
          type="text"
          value={form.colors}
          onChange={(e) => setForm({ ...form, colors: e.target.value })}
          className={inputClass}
          placeholder="Black, White, Navy"
        />
      </div>

      {/* Inventory */}
      <div>
        <label className={labelClass}>Inventory Count</label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.inventory_count}
          onChange={(e) => setForm({ ...form, inventory_count: e.target.value })}
          className={inputClass}
          placeholder="Leave blank for unlimited"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className={labelClass}>Product Image</label>
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:border file:border-charcoal/10 file:text-sm file:font-semibold file:bg-off-white-2 file:text-charcoal hover:file:bg-charcoal/5 file:cursor-pointer file:transition-colors"
          />
          {uploading && <span className="text-xs text-gold">Uploading...</span>}
        </div>
        {form.image_url && (
          <div className="mt-3 relative w-32 h-32 overflow-hidden border border-charcoal/10">
            <Image src={form.image_url} alt="Preview" fill className="object-cover" sizes="128px" />
          </div>
        )}
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className={`${inputClass} mt-2`}
          placeholder="Or paste image URL"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="border-charcoal/10 bg-off-white text-gold focus:ring-gold/30"
          />
          <span className="text-sm text-muted">Active (visible on public merch page)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_limited}
            onChange={(e) => setForm({ ...form, is_limited: e.target.checked })}
            className="border-charcoal/10 bg-off-white text-gold focus:ring-gold/30"
          />
          <span className="text-sm text-muted">Limited Time</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_archive}
            onChange={(e) => setForm({ ...form, is_archive: e.target.checked })}
            className="border-charcoal/10 bg-off-white text-gold focus:ring-gold/30"
          />
          <span className="text-sm text-muted">Archive (hidden from main listing but still accessible)</span>
        </label>
      </div>

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 disabled:opacity-50 transition-colors text-sm"
        >
          {status === "loading" ? "Saving..." : id ? "Update Item" : "Add Item"}
        </button>
        {id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-charcoal/10 text-muted hover:text-charcoal transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
