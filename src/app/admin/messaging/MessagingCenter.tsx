"use client";

import { useState } from "react";
import type { Subscriber, EmailTemplate, EmailQueueItem, EmailRecipient, EmailTrackingEvent } from "@/lib/supabase";

type Tab = "subscribers" | "templates" | "compose" | "queue" | "sent";

type SentDetail = EmailQueueItem & {
  recipients: EmailRecipient[];
  tracking: EmailTrackingEvent[];
};

export default function MessagingCenter({
  initialSubscribers,
  initialTemplates,
  initialQueue,
}: {
  initialSubscribers: Subscriber[];
  initialTemplates: EmailTemplate[];
  initialQueue: EmailQueueItem[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("subscribers");
  const [subscribers] = useState(initialSubscribers);
  const [templates, setTemplates] = useState(initialTemplates);
  const [queue, setQueue] = useState(initialQueue);

  // Compose state
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeStatus, setComposeStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Template edit state
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // Draft edit state
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [draftEditSubject, setDraftEditSubject] = useState("");
  const [draftEditBody, setDraftEditBody] = useState("");
  const [draftEditSchedule, setDraftEditSchedule] = useState("");
  const [draftEditStatus, setDraftEditStatus] = useState<"idle" | "saving" | "error">("idle");

  // Sent detail state
  const [sentDetail, setSentDetail] = useState<SentDetail | null>(null);
  const [sentDetailLoading, setSentDetailLoading] = useState(false);

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  const drafts = queue.filter((q) => q.status === "draft");
  const sentEmails = queue.filter((q) => q.status === "sent");

  const tabs: { key: Tab; label: string }[] = [
    { key: "subscribers", label: `Subscribers (${subscribers.length})` },
    { key: "templates", label: "Templates" },
    { key: "compose", label: "Compose" },
    { key: "queue", label: `Queue (${drafts.length} draft${drafts.length !== 1 ? "s" : ""})` },
    { key: "sent", label: `Sent (${sentEmails.length})` },
  ];

  async function handleCompose() {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    setComposeStatus("saving");

    const res = await fetch("/api/admin/email-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: composeSubject, body: composeBody }),
    });

    if (res.ok) {
      const item = await res.json();
      setQueue((prev) => [item, ...prev]);
      setComposeSubject("");
      setComposeBody("");
      setComposeStatus("saved");
      setTimeout(() => setComposeStatus("idle"), 2000);
    } else {
      setComposeStatus("error");
    }
  }

  async function handleSendDraft(id: string) {
    if (!confirm(`Send this email to all ${subscribers.length} subscribers? This cannot be undone.`)) return;

    const res = await fetch("/api/admin/email-queue", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "send" }),
    });

    if (res.ok) {
      const data = await res.json();
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: "sent" as const, sent_at: new Date().toISOString(), recipient_count: data.recipientCount ?? 0, scheduled_for: null }
            : q
        )
      );
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to send.");
    }
  }

  async function handleDeleteDraft(id: string) {
    if (!confirm("Delete this draft? This cannot be undone.")) return;

    const res = await fetch(`/api/admin/email-queue?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setQueue((prev) => prev.filter((q) => q.id !== id));
      if (editingDraft === id) setEditingDraft(null);
    } else {
      alert("Failed to delete draft.");
    }
  }

  function startEditDraft(item: EmailQueueItem) {
    setEditingDraft(item.id);
    setDraftEditSubject(item.subject);
    setDraftEditBody(item.body);
    setDraftEditSchedule(item.scheduled_for ? item.scheduled_for.slice(0, 16) : "");
    setDraftEditStatus("idle");
  }

  async function handleSaveDraft() {
    if (!editingDraft || !draftEditSubject.trim() || !draftEditBody.trim()) return;
    setDraftEditStatus("saving");

    const res = await fetch("/api/admin/email-queue", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingDraft,
        action: "edit",
        subject: draftEditSubject,
        body: draftEditBody,
        scheduled_for: draftEditSchedule ? new Date(draftEditSchedule).toISOString() : null,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setQueue((prev) => prev.map((q) => (q.id === editingDraft ? updated : q)));
      setEditingDraft(null);
      setDraftEditStatus("idle");
    } else {
      setDraftEditStatus("error");
    }
  }

  async function handleScheduleDraft(id: string, scheduledFor: string) {
    const res = await fetch("/api/admin/email-queue", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "schedule", scheduled_for: new Date(scheduledFor).toISOString() }),
    });

    if (res.ok) {
      const updated = await res.json();
      setQueue((prev) => prev.map((q) => (q.id === id ? updated : q)));
    } else {
      alert("Failed to schedule.");
    }
  }

  async function handleSaveTemplate(template: EmailTemplate) {
    setTemplateStatus((prev) => ({ ...prev, [template.id]: "saving" }));

    const res = await fetch("/api/admin/email-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: template.id,
        subject: template.subject,
        body: template.body,
      }),
    });

    setTemplateStatus((prev) => ({
      ...prev,
      [template.id]: res.ok ? "saved" : "error",
    }));

    if (res.ok) {
      setEditingTemplate(null);
      setTimeout(() => setTemplateStatus((prev) => ({ ...prev, [template.id]: "idle" })), 2000);
    }
  }

  function exportSubscribers() {
    const csv = ["email,subscribed_at"]
      .concat(subscribers.map((s) => `${s.email},${s.subscribed_at}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function loadSentDetail(id: string) {
    setSentDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/email-queue?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSentDetail(data);
      }
    } finally {
      setSentDetailLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${styles[status] ?? "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDateTime(d: string) {
    return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSentDetail(null); }}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key
                ? "border-gold text-charcoal"
                : "border-transparent text-muted hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{subscribers.length} active subscriber{subscribers.length !== 1 ? "s" : ""}</p>
            <button
              onClick={exportSubscribers}
              className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
            >
              Export CSV
            </button>
          </div>
          <div className="bg-white border border-charcoal/10">
            {subscribers.length === 0 ? (
              <p className="p-6 text-sm text-muted text-center">No subscribers yet.</p>
            ) : (
              <div className="divide-y divide-charcoal/5">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="px-5 py-3 flex items-center justify-between">
                    <span className="text-sm text-charcoal">{sub.email}</span>
                    <span className="text-xs text-muted">
                      {new Date(sub.subscribed_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="bg-white border border-charcoal/10 p-6 text-center">
              <p className="text-sm text-muted">No email templates found.</p>
            </div>
          ) : (
            templates.map((template) => {
              const isEditing = editingTemplate === template.id;
              const status = templateStatus[template.id] ?? "idle";

              return (
                <div key={template.id} className="bg-white border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-gold">
                      {template.template_key.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <button
                          onClick={() => handleSaveTemplate(template)}
                          disabled={status === "saving"}
                          className="text-xs px-3 py-1 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
                        >
                          {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Save"}
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTemplate(isEditing ? null : template.id)}
                        className="text-xs px-3 py-1 border border-charcoal/10 text-muted hover:text-charcoal transition-colors"
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Subject</label>
                        <input
                          type="text"
                          value={template.subject}
                          onChange={(e) =>
                            setTemplates((prev) =>
                              prev.map((t) =>
                                t.id === template.id ? { ...t, subject: e.target.value } : t
                              )
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Body</label>
                        <textarea
                          rows={8}
                          value={template.body}
                          onChange={(e) =>
                            setTemplates((prev) =>
                              prev.map((t) =>
                                t.id === template.id ? { ...t, body: e.target.value } : t
                              )
                            )
                          }
                          className={`${inputClass} resize-none font-mono text-xs`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-charcoal font-semibold">{template.subject}</p>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{template.body}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <div className="bg-white border border-charcoal/10 p-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Subject</label>
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className={inputClass}
              placeholder="Email subject line..."
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Body</label>
            <textarea
              rows={10}
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Write your email content here... HTML is supported."
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted">
              This will create a draft. You can review, edit, schedule, and send it from the Queue tab.
            </p>
            <button
              onClick={handleCompose}
              disabled={composeStatus === "saving" || !composeSubject.trim() || !composeBody.trim()}
              className="text-xs px-4 py-2 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
            >
              {composeStatus === "saving" ? "Creating..." : composeStatus === "saved" ? "Draft Created" : "Create Draft"}
            </button>
          </div>
          {composeStatus === "error" && (
            <p className="text-xs" style={{ color: "#9C4A38" }}>Failed to create draft.</p>
          )}
        </div>
      )}

      {/* Queue Tab */}
      {activeTab === "queue" && (
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <div className="bg-white border border-charcoal/10 p-6 text-center">
              <p className="text-sm text-muted">No drafts in queue.</p>
              <button
                onClick={() => setActiveTab("compose")}
                className="mt-3 text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
              >
                Compose New Email
              </button>
            </div>
          ) : (
            drafts.map((item) => {
              const isEditing = editingDraft === item.id;

              return (
                <div key={item.id} className="bg-white border border-charcoal/10 p-5">
                  {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-widest text-gold">Edit Draft</span>
                        <button
                          onClick={() => { setEditingDraft(null); setDraftEditStatus("idle"); }}
                          className="text-xs px-3 py-1 border border-charcoal/10 text-muted hover:text-charcoal transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Subject</label>
                        <input
                          type="text"
                          value={draftEditSubject}
                          onChange={(e) => setDraftEditSubject(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Body</label>
                        <textarea
                          rows={10}
                          value={draftEditBody}
                          onChange={(e) => setDraftEditBody(e.target.value)}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">
                          Schedule Send (optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={draftEditSchedule}
                          onChange={(e) => setDraftEditSchedule(e.target.value)}
                          className={inputClass}
                        />
                        {draftEditSchedule && (
                          <button
                            onClick={() => setDraftEditSchedule("")}
                            className="mt-1 text-xs text-muted hover:text-charcoal transition-colors"
                          >
                            Clear schedule
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        {draftEditStatus === "error" && (
                          <span className="text-xs" style={{ color: "#9C4A38" }}>Save failed.</span>
                        )}
                        <button
                          onClick={handleSaveDraft}
                          disabled={draftEditStatus === "saving" || !draftEditSubject.trim() || !draftEditBody.trim()}
                          className="text-xs px-4 py-2 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
                        >
                          {draftEditStatus === "saving" ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {item.scheduled_for ? getStatusBadge("scheduled") : getStatusBadge("draft")}
                          <span className="text-sm font-semibold text-charcoal">{item.subject}</span>
                        </div>
                        <span className="text-xs text-muted">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted line-clamp-2 mb-2">{item.body}</p>
                      {item.scheduled_for && (
                        <p className="text-xs text-blue-700 mb-2">
                          Scheduled for: {formatDateTime(item.scheduled_for)}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditDraft(item)}
                            className="text-xs px-3 py-1.5 border border-charcoal/10 text-muted hover:text-charcoal hover:border-gold/40 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(item.id)}
                            className="text-xs px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                          {!item.scheduled_for && (
                            <button
                              onClick={() => {
                                const dt = prompt("Enter date/time to schedule (e.g. 2025-01-15 7:00 PM):");
                                if (dt) {
                                  const parsed = new Date(dt);
                                  if (!isNaN(parsed.getTime())) {
                                    handleScheduleDraft(item.id, parsed.toISOString());
                                  } else {
                                    alert("Invalid date format. Please try again.");
                                  }
                                }
                              }}
                              className="text-xs px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              Schedule
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleSendDraft(item.id)}
                          className="text-xs px-4 py-1.5 bg-gold text-charcoal font-semibold hover:bg-gold/80 transition-colors"
                        >
                          Send Now
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Sent Tab */}
      {activeTab === "sent" && (
        <div className="space-y-3">
          {sentDetail ? (
            /* Sent Email Detail View */
            <div>
              <button
                onClick={() => setSentDetail(null)}
                className="text-xs text-muted hover:text-charcoal transition-colors mb-4 flex items-center gap-1"
              >
                &larr; Back to Sent
              </button>
              <div className="bg-white border border-charcoal/10 p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge("sent")}
                  <span className="text-xs text-muted">{formatDateTime(sentDetail.sent_at!)}</span>
                </div>
                <h3 className="text-base font-semibold text-charcoal mb-2">{sentDetail.subject}</h3>
                <div className="text-sm text-muted mb-4 whitespace-pre-wrap border-t border-charcoal/5 pt-3 mt-3">
                  {sentDetail.body}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 border-t border-charcoal/5 pt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-charcoal">{sentDetail.recipient_count || sentDetail.recipients.length}</p>
                    <p className="text-xs text-muted">Recipients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-charcoal">
                      {new Set(sentDetail.tracking.filter((t) => t.event_type === "open").map((t) => t.recipient_email)).size}
                    </p>
                    <p className="text-xs text-muted">Unique Opens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-charcoal">
                      {new Set(sentDetail.tracking.filter((t) => t.event_type === "click").map((t) => t.recipient_email)).size}
                    </p>
                    <p className="text-xs text-muted">Unique Clicks</p>
                  </div>
                </div>
              </div>

              {/* Recipient List */}
              <div className="bg-white border border-charcoal/10">
                <div className="px-5 py-3 border-b border-charcoal/5">
                  <span className="font-mono text-xs uppercase tracking-widest text-gold">Recipients</span>
                </div>
                {sentDetail.recipients.length === 0 ? (
                  <p className="p-5 text-xs text-muted text-center">No recipient data recorded for this email.</p>
                ) : (
                  <div className="divide-y divide-charcoal/5 max-h-80 overflow-y-auto">
                    {sentDetail.recipients.map((r) => {
                      const opens = sentDetail.tracking.filter(
                        (t) => t.recipient_email === r.email && t.event_type === "open"
                      );
                      const clicks = sentDetail.tracking.filter(
                        (t) => t.recipient_email === r.email && t.event_type === "click"
                      );
                      return (
                        <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                          <span className="text-sm text-charcoal">{r.email}</span>
                          <div className="flex items-center gap-3">
                            {opens.length > 0 && (
                              <span className="text-xs text-green-700">
                                Opened {opens.length > 1 ? `${opens.length}x` : ""}
                              </span>
                            )}
                            {clicks.length > 0 && (
                              <span className="text-xs text-blue-700">
                                {clicks.length} click{clicks.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {opens.length === 0 && clicks.length === 0 && (
                              <span className="text-xs text-muted">No activity</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Click Details */}
              {sentDetail.tracking.filter((t) => t.event_type === "click").length > 0 && (
                <div className="bg-white border border-charcoal/10 mt-4">
                  <div className="px-5 py-3 border-b border-charcoal/5">
                    <span className="font-mono text-xs uppercase tracking-widest text-gold">Link Clicks</span>
                  </div>
                  <div className="divide-y divide-charcoal/5 max-h-60 overflow-y-auto">
                    {sentDetail.tracking
                      .filter((t) => t.event_type === "click")
                      .map((t) => (
                        <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-charcoal">{t.recipient_email}</span>
                            {t.url && (
                              <p className="text-xs text-blue-600 truncate max-w-xs">{t.url}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted">{formatDateTime(t.created_at)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sent Email List */
            <>
              {sentEmails.length === 0 ? (
                <div className="bg-white border border-charcoal/10 p-6 text-center">
                  <p className="text-sm text-muted">No emails have been sent yet.</p>
                </div>
              ) : (
                sentEmails.map((item) => (
                  <div key={item.id} className="bg-white border border-charcoal/10 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusBadge("sent")}
                        <span className="text-sm font-semibold text-charcoal">{item.subject}</span>
                      </div>
                      <span className="text-xs text-muted">
                        {item.sent_at ? formatDateTime(item.sent_at) : formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mb-3">{item.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {item.recipient_count ? `${item.recipient_count} recipient${item.recipient_count !== 1 ? "s" : ""}` : ""}
                      </span>
                      <button
                        onClick={() => loadSentDetail(item.id)}
                        disabled={sentDetailLoading}
                        className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
                      >
                        {sentDetailLoading ? "Loading..." : "View Details"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
