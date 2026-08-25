"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PERMISSION_KEYS = [
  { key: "events", label: "Events" },
  { key: "comedians", label: "Comedians" },
  { key: "past_events", label: "Past Shows" },
  { key: "merch", label: "Merch" },
  { key: "gallery", label: "Gallery" },
  { key: "orders", label: "Orders" },
  { key: "inquiries", label: "Inquiries" },
  { key: "messages", label: "Messages" },
  { key: "about", label: "About" },
  { key: "site", label: "Site Settings" },
];

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "manager" | "staff";
  permissions: Record<string, boolean>;
  created_at: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"manager" | "staff">("staff");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Permissions state
  const [permState, setPermState] = useState<Record<string, boolean>>({});

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.status === 401) {
      router.push("/admin/dashboard");
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("staff");
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(user: AdminUser) {
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setEditingId(user.id);
    setFormError("");
    setShowForm(true);
  }

  function startPermissions(user: AdminUser) {
    setEditingPermissions(user.id);
    setPermState(user.permissions || {});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSaving(true);
    setFormError("");

    if (editingId) {
      // Update existing user
      const body: Record<string, unknown> = {};
      const current = users.find((u) => u.id === editingId);
      if (formName !== current?.name) body.name = formName;
      if (formEmail !== current?.email) body.email = formEmail;
      if (formPassword) body.password = formPassword;
      if (formRole !== current?.role) body.role = formRole;

      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setFormSaving(false);
      if (!res.ok) {
        setFormError(data.error || "Failed to update user.");
        return;
      }
    } else {
      // Create new user
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });
      const data = await res.json();
      setFormSaving(false);
      if (!res.ok) {
        setFormError(data.error || "Failed to create user.");
        return;
      }
    }

    resetForm();
    fetchUsers();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete admin user "${name}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to delete user.");
      return;
    }
    fetchUsers();
  }

  async function savePermissions(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: permState }),
    });
    if (res.ok) {
      setEditingPermissions(null);
      fetchUsers();
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal">
            Admin Users
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage who has access to the admin portal
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-colors"
          >
            Add User
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "#9C4A38" }}>
          {error}
        </p>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-charcoal/10 p-6 mb-8">
          <h2 className="font-mono text-xs font-medium text-muted uppercase tracking-wide mb-5">
            {editingId ? "Edit User" : "New User"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  {editingId ? "New Password (leave blank to keep)" : "Password"}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  {...(!editingId ? { required: true } : {})}
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) =>
                    setFormRole(e.target.value as "manager" | "staff")
                  }
                  className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-sm" style={{ color: "#9C4A38" }}>
                {formError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formSaving}
                className="px-5 py-2.5 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
              >
                {formSaving
                  ? "Saving..."
                  : editingId
                  ? "Update User"
                  : "Create User"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 border border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id}>
            <div className="bg-white border border-charcoal/10 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                      user.role === "manager"
                        ? "bg-gold/20 text-charcoal"
                        : "bg-charcoal/10 text-muted"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.role === "staff" && (
                  <button
                    onClick={() => startPermissions(user)}
                    className="text-xs text-muted hover:text-charcoal transition-colors"
                  >
                    Permissions
                  </button>
                )}
                <button
                  onClick={() => startEdit(user)}
                  className="text-xs text-muted hover:text-charcoal transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  className="text-xs text-muted hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Inline permissions editor */}
            {editingPermissions === user.id && (
              <div className="bg-off-white border border-t-0 border-charcoal/10 p-5">
                <h3 className="font-mono text-xs font-medium text-muted uppercase tracking-wide mb-3">
                  Staff Permissions for {user.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {PERMISSION_KEYS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm text-charcoal cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={permState[key] ?? false}
                        onChange={(e) =>
                          setPermState((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="accent-gold"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => savePermissions(user.id)}
                    className="px-4 py-2 bg-charcoal text-off-white text-xs font-semibold hover:bg-charcoal-2 transition-colors"
                  >
                    Save Permissions
                  </button>
                  <button
                    onClick={() => setEditingPermissions(null)}
                    className="px-4 py-2 border border-charcoal/20 text-charcoal text-xs hover:bg-charcoal/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
