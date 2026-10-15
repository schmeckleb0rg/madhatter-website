"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type JobListing = {
  id: string;
  title: string;
  department: string | null;
  type: string;
  description: string | null;
  requirements: string | null;
  compensation: string | null;
  application_email: string | null;
  expires_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type JobApplication = {
  id: string;
  listing_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  answers: Record<string, string>;
  is_read: boolean;
  created_at: string;
  job_listings: { title: string } | null;
};

type Props = {
  initialListings: JobListing[];
  initialApplications: JobApplication[];
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function EmploymentAdmin({ initialListings, initialApplications }: Props) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [applications, setApplications] = useState(initialApplications);
  const [tab, setTab] = useState<"listings" | "applications">("listings");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("part-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [compensation, setCompensation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  function resetForm() {
    setTitle("");
    setDepartment("");
    setType("part-time");
    setDescription("");
    setRequirements("");
    setCompensation("");
    setIsActive(true);
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
  }

  function editListing(l: JobListing) {
    setTitle(l.title);
    setDepartment(l.department || "");
    setType(l.type);
    setDescription(l.description || "");
    setRequirements(l.requirements || "");
    setCompensation(l.compensation || "");
    setIsActive(l.is_active);
    setSortOrder(l.sort_order);
    setEditingId(l.id);
    setShowForm(true);
  }

  async function saveListing() {
    const payload = {
      title,
      department: department || null,
      type,
      description: description || null,
      requirements: requirements || null,
      compensation: compensation || null,
      is_active: isActive,
      sort_order: sortOrder,
    };

    const url = editingId
      ? `/api/admin/employment/${editingId}`
      : "/api/admin/employment";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setListings((prev) => prev.map((l) => (l.id === editingId ? data : l)));
      } else {
        setListings((prev) => [...prev, data]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("Delete this listing?")) return;
    const res = await fetch(`/api/admin/employment/${id}`, { method: "DELETE" });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      router.refresh();
    }
  }

  async function markRead(id: string, is_read: boolean) {
    const res = await fetch("/api/admin/employment/applications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_read }),
    });
    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read } : a))
      );
    }
  }

  const unreadCount = applications.filter((a) => !a.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Employment</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("listings")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
              tab === "listings" ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => setTab("applications")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors relative ${
              tab === "applications" ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
            }`}
          >
            Applications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === "listings" ? (
        <>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="mb-4 px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
          >
            + Add Listing
          </button>

          {showForm && (
            <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job Title *" className={inputClass} />
                <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="gig">Gig</option>
                  <option value="internship">Internship</option>
                </select>
                <input value={compensation} onChange={(e) => setCompensation(e.target.value)} placeholder="Compensation" className={inputClass} />
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="Sort Order" className={inputClass} />
              </div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className={inputClass} />
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Requirements" rows={3} className={inputClass} />
              <label className="flex items-center gap-2 text-sm text-off-white">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active
              </label>
              <div className="flex gap-2">
                <button onClick={saveListing} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
                  {editingId ? "Update" : "Create"}
                </button>
                <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {listings.map((l) => (
              <div key={l.id} className="flex items-center justify-between bg-white/5 border border-off-white/10 px-4 py-3">
                <div>
                  <span className={`text-sm font-medium ${l.is_active ? "text-off-white" : "text-muted-dark"}`}>
                    {l.title}
                  </span>
                  <span className="ml-2 text-xs text-gold">{l.type}</span>
                  {l.department && <span className="ml-2 text-xs text-muted-dark">{l.department}</span>}
                  {!l.is_active && <span className="ml-2 text-xs text-red-400">Inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editListing(l)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                    Edit
                  </button>
                  <button onClick={() => deleteListing(l.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <p className="text-sm text-muted-dark py-4">No job listings yet.</p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <div key={app.id} className="bg-white/5 border border-off-white/10 overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
              >
                <div className="flex items-center gap-3">
                  {!app.is_read && <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0" />}
                  <div>
                    <span className="text-sm font-medium text-off-white">{app.name}</span>
                    <span className="ml-2 text-xs text-muted-dark">{app.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {app.job_listings?.title && (
                    <span className="text-xs text-gold">{app.job_listings.title}</span>
                  )}
                  <span className="text-xs text-muted-dark">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {expandedApp === app.id && (
                <div className="px-4 pb-4 border-t border-off-white/5 pt-3 space-y-3">
                  {app.phone && (
                    <p className="text-sm text-muted-dark">Phone: {app.phone}</p>
                  )}
                  {Object.entries(app.answers).map(([key, val]) => (
                    <div key={key}>
                      <div className="text-xs text-gold font-mono uppercase tracking-wider mb-1">
                        {key.replace(/_/g, " ")}
                      </div>
                      <p className="text-sm text-off-white whitespace-pre-line">{val}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => markRead(app.id, !app.is_read)}
                    className="text-xs text-muted-dark hover:text-off-white transition-colors"
                  >
                    Mark as {app.is_read ? "unread" : "read"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {applications.length === 0 && (
            <p className="text-sm text-muted-dark py-4">No applications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
