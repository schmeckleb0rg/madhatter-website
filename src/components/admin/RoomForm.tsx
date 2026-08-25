"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/supabase";
import MediaUpload from "@/components/admin/MediaUpload";

export default function RoomForm({ initialData, id }: { initialData?: Partial<Room>; id?: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    features: Array.isArray(initialData?.features) ? initialData.features.join(", ") : "",
    capacity: initialData?.capacity?.toString() ?? "",
    image_url: initialData?.image_url ?? "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      features: form.features || undefined,
      capacity: form.capacity ? Number(form.capacity) : null,
      image_url: form.image_url || "",
    };

    const res = await fetch(id ? `/api/admin/rooms/${id}` : "/api/admin/rooms", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
      return;
    }

    router.push("/admin/rooms");
    router.refresh();
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this room? This cannot be undone.")) return;
    await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
    router.push("/admin/rooms");
    router.refresh();
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          required
          maxLength={200}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          placeholder="Main Stage"
        />
      </div>

      <div>
        <label className={labelClass}>Slug *</label>
        <input
          type="text"
          required
          maxLength={100}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className={inputClass}
          placeholder="main-stage"
        />
        <p className="text-xs text-muted mt-1">URL-friendly identifier (e.g., &quot;main-stage&quot;)</p>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={4}
          maxLength={2000}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Describe this room..."
        />
      </div>

      <div>
        <label className={labelClass}>Features (comma-separated)</label>
        <input
          type="text"
          maxLength={2000}
          value={form.features}
          onChange={(e) => setForm({ ...form, features: e.target.value })}
          className={inputClass}
          placeholder="Full bar, Stage lighting, Sound system, VIP seating"
        />
        <p className="text-xs text-muted mt-1">Separate each feature with a comma.</p>
      </div>

      <div>
        <label className={labelClass}>Capacity</label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          className={inputClass}
          placeholder="200"
        />
      </div>

      <MediaUpload
        label="Room Photo"
        value={form.image_url}
        onChange={(url) => setForm({ ...form, image_url: url })}
        folder="rooms"
        hint="Recommended: 1200 × 800 px · PNG or JPEG · Max 100 MB"
      />

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 disabled:opacity-50 transition-colors text-sm"
        >
          {status === "loading" ? "Saving..." : id ? "Update Room" : "Add Room"}
        </button>
        <div className="flex gap-3">
          {id && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 sm:flex-none px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none px-6 py-3 border border-charcoal/10 text-muted hover:text-charcoal transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
