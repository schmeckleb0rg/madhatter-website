"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventGenre } from "@/lib/supabase";

export default function GenresAdmin({ initialGenres }: { initialGenres: EventGenre[] }) {
  const router = useRouter();
  const [genres, setGenres] = useState(initialGenres);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#B8934A");
  const [createStatus, setCreateStatus] = useState<"idle" | "loading">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const inputClass = "bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateStatus("loading");

    const res = await fetch("/api/admin/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });

    if (res.ok) {
      const genre = await res.json();
      setGenres([...genres, genre].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewColor("#B8934A");
    }
    setCreateStatus("idle");
  }

  async function handleUpdate(id: string) {
    await fetch(`/api/admin/genres/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    setGenres(genres.map((g) => g.id === id ? { ...g, name: editName, color: editColor } : g));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this genre? It will be removed from all events.")) return;
    await fetch(`/api/admin/genres/${id}`, { method: "DELETE" });
    setGenres(genres.filter((g) => g.id !== id));
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Show Genres</h1>
        <p className="text-sm text-muted mt-1">Manage genre categories for events. Assign genres in the event editor.</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={`${inputClass} flex-1`}
          placeholder="New genre name"
          required
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 border border-charcoal/10 cursor-pointer"
          />
          <button
            type="submit"
            disabled={createStatus === "loading"}
            className="px-5 py-3 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Genre list */}
      {genres.length === 0 ? (
        <div className="text-center py-20 text-muted">No genres yet.</div>
      ) : (
        <div className="space-y-2">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="flex items-center justify-between bg-white border border-charcoal/10 px-5 py-3"
            >
              {editingId === genre.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 border border-charcoal/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <button onClick={() => handleUpdate(genre.id)} className="text-xs px-3 py-1 bg-charcoal text-off-white hover:bg-charcoal-2 transition-colors">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-muted hover:text-charcoal transition-colors">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: genre.color }} />
                    <span className="font-mono text-sm text-charcoal">{genre.name}</span>
                    <span className="font-mono text-xs text-muted">{genre.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingId(genre.id); setEditName(genre.name); setEditColor(genre.color); }}
                      className="text-xs text-muted hover:text-charcoal transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(genre.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
