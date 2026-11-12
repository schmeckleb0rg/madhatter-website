"use client";

import { useState, useEffect } from "react";

type Props = {
  pageKey: string;
  label: string;
};

export default function PageVisibilityToggle({ pageKey, label }: Props) {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/page-visibility")
      .then((r) => r.json())
      .then((data) => {
        const settingKey = `page_visible_${pageKey}`;
        setVisible(data[settingKey] !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageKey]);

  async function toggle() {
    const newValue = !visible;
    setVisible(newValue);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/page-visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`page_visible_${pageKey}`]: newValue }),
      });
      if (!res.ok) setVisible(!newValue); // revert on error
    } catch {
      setVisible(!newValue);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="flex items-center gap-3 bg-white border border-charcoal/10 px-4 py-3 mb-6">
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 ${
          visible ? "bg-gold" : "bg-charcoal/20"
        } ${saving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
            visible ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-charcoal">
          {label} page {visible ? "visible" : "hidden"}
        </span>
        <span className="text-xs text-muted ml-2">
          {visible
            ? "Shown in navigation & footer"
            : "Hidden from public site"}
        </span>
      </div>
      {saving && (
        <span className="text-xs text-muted animate-pulse">Saving...</span>
      )}
    </div>
  );
}
