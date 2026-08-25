"use client";

import { useState } from "react";
import type { Subscriber, EmailTemplate, EmailQueueItem } from "@/lib/supabase";

type Tab = "subscribers" | "templates" | "compose" | "queue";

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

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  const tabs: { key: Tab; label: string }[] = [
    { key: "subscribers", label: `Subscribers (${subscribers.length})` },
    { key: "templates", label: "Templates" },
    { key: "compose", label: "Compose" },
    { key: "queue", label: `Queue (${queue.filter((q) => q.status === "draft").length} drafts)` },
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
    if (!confirm("Send this email to all subscribers? This cannot be undone.")) return;

    const res = await fetch("/api/admin/email-queue", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "send" }),
    });

    if (res.ok) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, status: "sent" as const, sent_at: new Date().toISOString() } : q
        )
      );
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to send.");
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

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${styles[status] ?? "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px ${
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
              This will create a draft. You can review and send it from the Queue tab.
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
          {queue.length === 0 ? (
            <div className="bg-white border border-charcoal/10 p-6 text-center">
              <p className="text-sm text-muted">No emails in queue.</p>
            </div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="bg-white border border-charcoal/10 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    <span className="text-sm font-semibold text-charcoal">{item.subject}</span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted line-clamp-2 mb-3">{item.body}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted">
                    {item.sent_at && `Sent: ${new Date(item.sent_at).toLocaleString()}`}
                  </div>
                  {item.status === "draft" && (
                    <button
                      onClick={() => handleSendDraft(item.id)}
                      className="text-xs px-4 py-1.5 bg-gold text-charcoal font-semibold hover:bg-gold/80 transition-colors"
                    >
                      Review & Send
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
