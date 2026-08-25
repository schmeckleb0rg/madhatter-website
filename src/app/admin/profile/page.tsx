"use client";

import { useState, useEffect } from "react";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "manager" | "staff";
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Enter your current password to set a new one.");
      return;
    }

    setSaving(true);

    const body: Record<string, string> = {};
    if (name !== profile?.name) body.name = name;
    if (email !== profile?.email) body.email = email;
    if (newPassword) {
      body.current_password = currentPassword;
      body.new_password = newPassword;
    }

    if (Object.keys(body).length === 0) {
      setMessage("No changes to save.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to update profile.");
      return;
    }

    setProfile(data);
    setName(data.name);
    setEmail(data.email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Profile updated successfully.");
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal">
          My Profile
        </h1>
        <p className="text-sm text-muted mt-1">
          {profile.role === "manager" ? "Manager" : "Staff"}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white border border-charcoal/10 p-6 space-y-5">
          <h2 className="font-mono text-xs font-medium text-muted uppercase tracking-wide">
            Account Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white border border-charcoal/10 p-6 space-y-5">
          <h2 className="font-mono text-xs font-medium text-muted uppercase tracking-wide">
            Change Password
          </h2>
          <p className="text-xs text-muted">
            Leave blank to keep your current password.
          </p>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#9C4A38" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
