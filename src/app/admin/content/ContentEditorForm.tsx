"use client";

import { useState } from "react";
import type { PageContent } from "@/lib/supabase";

const PAGE_LABELS: Record<string, string> = {
  events: "Events",
  comedians: "Comedians",
  merch: "Merch",
  about: "About",
  rooms: "Rooms",
  contact: "Contact",
  ticker: "Ticker",
};

type GroupedContent = Record<string, PageContent[]>;

export default function ContentEditorForm({ initial }: { initial: PageContent[] }) {
  const grouped: GroupedContent = {};
  initial.forEach((item) => {
    if (!grouped[item.page_key]) grouped[item.page_key] = [];
    grouped[item.page_key].push(item);
  });

  const [data, setData] = useState<GroupedContent>(grouped);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateContent(pageKey: string, sectionKey: string, value: string) {
    setData((prev) => ({
      ...prev,
      [pageKey]: (prev[pageKey] ?? []).map((item) =>
        item.section_key === sectionKey ? { ...item, content: value } : item
      ),
    }));
  }

  async function saveSection(pageKey: string) {
    setSaving((prev) => ({ ...prev, [pageKey]: "saving" }));
    const items = data[pageKey] ?? [];
    let allOk = true;

    for (const item of items) {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: item.page_key,
          section_key: item.section_key,
          content: item.content,
        }),
      });
      if (!res.ok) allOk = false;
    }

    setSaving((prev) => ({ ...prev, [pageKey]: allOk ? "saved" : "error" }));
    if (allOk) setTimeout(() => setSaving((prev) => ({ ...prev, [pageKey]: "idle" })), 2000);
  }

  const pageKeys = Object.keys(PAGE_LABELS);
  const allKeys = [...new Set([...pageKeys, ...Object.keys(data)])];

  return (
    <div className="space-y-4">
      {allKeys.map((pageKey) => {
        const items = data[pageKey] ?? [];
        const isOpen = openSections[pageKey] ?? false;
        const status = saving[pageKey] ?? "idle";
        const label = PAGE_LABELS[pageKey] ?? pageKey;

        return (
          <div key={pageKey} className="bg-white border border-charcoal/10">
            <button
              type="button"
              onClick={() => toggleSection(pageKey)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-off-white/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-charcoal">{label}</span>
                <span className="text-xs text-muted">{items.length} section{items.length !== 1 ? "s" : ""}</span>
              </div>
              <span className="text-muted text-xs">{isOpen ? "Collapse" : "Expand"}</span>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 space-y-4 border-t border-charcoal/10">
                {items.length === 0 && (
                  <p className="text-xs text-muted pt-4">No content sections found for this page.</p>
                )}
                {items.map((item) => (
                  <div key={item.section_key} className="pt-4">
                    <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">
                      {item.section_key.replace(/_/g, " ")}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={5000}
                      value={item.content}
                      onChange={(e) => updateContent(pageKey, item.section_key, e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                ))}
                {items.length > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => saveSection(pageKey)}
                      disabled={status === "saving"}
                      className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
                    >
                      {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Save Section"}
                    </button>
                    {status === "error" && (
                      <span className="text-xs" style={{ color: "#9C4A38" }}>Failed to save.</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
