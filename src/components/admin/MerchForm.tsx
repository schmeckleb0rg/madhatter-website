"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MerchItem } from "@/lib/supabase";
import Image from "next/image";

export default function MerchForm({ initialData, id }: { initialData?: Partial<MerchItem>; id?: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price_cents: initialData?.price_cents?.toString() ?? "",
    image_url: initialData?.image_url ?? "",
    tag: initialData?.tag ?? "",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const payload = {
      ...form,
      price_cents: form.price_cents ? Number(form.price_cents) : 0,
      tag: form.tag || null,
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
    "w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Name <span className="text-club-red">*</span></label>
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
          <label className={labelClass}>Price (cents) <span className="text-club-red">*</span></label>
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
            <p className="text-xs text-gray-500 mt-1">= ${(Number(form.price_cents) / 100).toFixed(2)}</p>
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

      {/* Image upload */}
      <div>
        <label className={labelClass}>Product Image</label>
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-club-border file:text-sm file:font-semibold file:bg-club-card file:text-gray-300 hover:file:bg-club-border file:cursor-pointer file:transition-colors"
          />
          {uploading && <span className="text-xs text-club-gold">Uploading...</span>}
        </div>
        {form.image_url && (
          <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-club-border">
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

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="rounded border-club-border bg-club-bg text-club-red focus:ring-club-gold/30"
        />
        <span className="text-sm text-gray-400">Active (visible on public merch page)</span>
      </label>

      {error && <p className="text-club-red text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
        >
          {status === "loading" ? "Saving..." : id ? "Update Item" : "Add Item"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-club-border text-gray-400 rounded hover:text-white transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
