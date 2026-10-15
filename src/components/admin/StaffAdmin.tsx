"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StaffMember } from "@/lib/supabase";

type Props = {
  initialStaff: StaffMember[];
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function StaffAdmin({ initialStaff }: Props) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  function resetForm() {
    setName("");
    setRole("");
    setLocation("");
    setBio("");
    setPhotoUrl("");
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
  }

  function editMember(m: StaffMember) {
    setName(m.name);
    setRole(m.role);
    setLocation(m.location || "");
    setBio(m.bio || "");
    setPhotoUrl(m.photo_url || "");
    setSortOrder(m.sort_order);
    setEditingId(m.id);
    setShowForm(true);
  }

  async function saveMember() {
    const payload = {
      name,
      role,
      location: location || null,
      bio: bio || null,
      photo_url: photoUrl || null,
      sort_order: sortOrder,
    };

    const endpoint = editingId
      ? `/api/admin/staff/${editingId}`
      : "/api/admin/staff";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setStaff((prev) => prev.map((m) => (m.id === editingId ? data : m)));
      } else {
        setStaff((prev) => [...prev, data]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Delete this staff member?")) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStaff((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Staff Members</h1>
      </div>

      <button
        onClick={() => { resetForm(); setShowForm(true); }}
        className="mb-4 px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
      >
        + Add Staff Member
      </button>

      {showForm && (
        <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" className={inputClass} />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role / Title *" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="From (Location)" className={inputClass} />
            <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL" className={inputClass} />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="Sort Order" className={inputClass} />
          </div>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={3} className={inputClass} />
          <div className="flex gap-2">
            <button onClick={saveMember} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {staff.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-white/5 border border-off-white/10 px-4 py-3">
            <div className="min-w-0">
              <span className="text-sm font-medium text-off-white">{m.name}</span>
              <span className="ml-2 text-xs text-gold">{m.role}</span>
              {m.location && <span className="ml-2 text-xs text-muted-dark">From: {m.location}</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => editMember(m)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                Edit
              </button>
              <button onClick={() => deleteMember(m.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <p className="text-sm text-muted-dark py-4">No staff members yet.</p>
        )}
      </div>
    </div>
  );
}
