"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TicketInquiry } from "@/lib/supabase";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Tab = "inbox" | "archived";

export default function InquiriesList({ inquiries }: { inquiries: TicketInquiry[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("inbox");

  const filtered = inquiries.filter((i) =>
    tab === "inbox" ? !i.is_archived : i.is_archived
  );
  const unread = inquiries.filter((i) => !i.is_read && !i.is_archived).length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  async function bulkAction(action: string, ids?: string[]) {
    const targetIds = ids ?? Array.from(selected);
    if (targetIds.length === 0) return;
    setLoading(action);
    await fetch("/api/admin/inquiries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: targetIds, action }),
    });
    setSelected(new Set());
    setLoading(null);
    router.refresh();
  }

  const hasSelection = selected.size > 0;
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-charcoal/10">
        <button
          onClick={() => { setTab("inbox"); setSelected(new Set()); }}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === "inbox"
              ? "border-gold text-charcoal"
              : "border-transparent text-muted hover:text-charcoal"
          }`}
        >
          Inbox{unread > 0 && <span className="ml-1.5 text-xs text-gold">({unread})</span>}
        </button>
        <button
          onClick={() => { setTab("archived"); setSelected(new Set()); }}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === "archived"
              ? "border-gold text-charcoal"
              : "border-transparent text-muted hover:text-charcoal"
          }`}
        >
          Archived
        </button>
      </div>

      {/* Bulk toolbar */}
      <div className="flex items-center gap-3 mb-3 min-h-[36px]">
        {filtered.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 accent-gold cursor-pointer"
            />
            <span className="text-xs text-muted">
              {hasSelection ? `${selected.size} selected` : "Select all"}
            </span>
          </label>
        )}

        {hasSelection && (
          <div className="flex items-center gap-2 ml-2">
            {tab === "inbox" && (
              <>
                <button
                  onClick={() => bulkAction("read")}
                  disabled={loading !== null}
                  className="text-xs px-3 py-1.5 border border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-colors disabled:opacity-50"
                >
                  {loading === "read" ? "..." : "Mark Read"}
                </button>
                <button
                  onClick={() => bulkAction("archive")}
                  disabled={loading !== null}
                  className="text-xs px-3 py-1.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
                >
                  {loading === "archive" ? "..." : "Archive"}
                </button>
              </>
            )}
            {tab === "archived" && (
              <button
                onClick={() => bulkAction("unarchive")}
                disabled={loading !== null}
                className="text-xs px-3 py-1.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
              >
                {loading === "unarchive" ? "..." : "Unarchive"}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Delete ${selected.size} inquiry(ies)? This cannot be undone.`)) {
                  bulkAction("delete");
                }
              }}
              disabled={loading !== null}
              className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loading === "delete" ? "..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Inquiry list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          {tab === "inbox" ? "No inquiries." : "No archived inquiries."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`bg-white border p-4 sm:p-5 flex items-start gap-3 ${
                !inquiry.is_read ? "border-gold/40" : "border-charcoal/10"
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(inquiry.id)}
                onChange={() => toggleSelect(inquiry.id)}
                className="w-4 h-4 mt-1 accent-gold cursor-pointer flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {!inquiry.is_read && (
                        <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                      )}
                      <span className="font-semibold text-charcoal">
                        {inquiry.name}
                      </span>
                      <span className="text-sm text-muted">
                        {inquiry.party_size}{" "}
                        {inquiry.party_size === 1 ? "guest" : "guests"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mb-2">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="hover:text-charcoal transition-colors"
                      >
                        {inquiry.email}
                      </a>
                      {inquiry.phone && <span>{inquiry.phone}</span>}
                    </div>
                    {inquiry.events && (
                      <div className="text-xs text-gold mb-2">
                        {inquiry.events.title} —{" "}
                        {new Date(inquiry.events.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </div>
                    )}
                    {inquiry.message && (
                      <p className="text-sm text-muted leading-relaxed">
                        {inquiry.message}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-2">
                      {formatDate(inquiry.created_at)}
                    </p>
                  </div>

                  {/* Per-row actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tab === "inbox" && !inquiry.is_read && (
                      <button
                        onClick={() => bulkAction("read", [inquiry.id])}
                        disabled={loading !== null}
                        className="text-xs px-3 py-1.5 border border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-colors disabled:opacity-50"
                      >
                        Mark Read
                      </button>
                    )}
                    {tab === "inbox" && (
                      <button
                        onClick={() => bulkAction("archive", [inquiry.id])}
                        disabled={loading !== null}
                        className="text-xs px-3 py-1.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                    {tab === "archived" && (
                      <button
                        onClick={() => bulkAction("unarchive", [inquiry.id])}
                        disabled={loading !== null}
                        className="text-xs px-3 py-1.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
                      >
                        Unarchive
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this inquiry? This cannot be undone.")) {
                          bulkAction("delete", [inquiry.id]);
                        }
                      }}
                      disabled={loading !== null}
                      className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
