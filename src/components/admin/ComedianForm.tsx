"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Comedian } from "@/lib/supabase";
import MediaUpload from "@/components/admin/MediaUpload";

type ComedianFormProps = {
  initialData?: Partial<Comedian>;
  id?: string;
};

export default function ComedianForm({ initialData, id }: ComedianFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    bio: initialData?.bio ?? "",
    headshot_url: initialData?.headshot_url ?? "",
    instagram: initialData?.social_links?.instagram ?? "",
    website: initialData?.social_links?.website ?? "",
    featured: initialData?.featured ?? false,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const social_links =
      form.instagram || form.website
        ? { instagram: form.instagram || undefined, website: form.website || undefined }
        : undefined;

    const payload = {
      name: form.name,
      bio: form.bio || undefined,
      headshot_url: form.headshot_url || undefined,
      social_links,
      featured: form.featured,
    };

    const res = await fetch(id ? `/api/admin/comedians/${id}` : "/api/admin/comedians", {
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

    router.push("/admin/comedians");
    router.refresh();
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this comedian? This cannot be undone.")) return;
    await fetch(`/api/admin/comedians/${id}`, { method: "DELETE" });
    router.push("/admin/comedians");
    router.refresh();
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Bio */}
      <div>
        <label className={labelClass}>Bio</label>
        <textarea
          rows={4}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Headshot */}
      <MediaUpload
        label="Headshot Photo"
        value={form.headshot_url}
        onChange={(url) => setForm({ ...form, headshot_url: url })}
        folder="comedians"
        hint="Recommended: 400 × 400 px square · PNG or JPEG · Max 100 MB"
      />

      {/* Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Instagram URL</label>
          <input
            type="url"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className={inputClass}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <label className={labelClass}>Website URL</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Featured toggle */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="accent-gold"
          />
          Featured
        </label>
      </div>

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "Saving..." : id ? "Update" : "Create"}
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
