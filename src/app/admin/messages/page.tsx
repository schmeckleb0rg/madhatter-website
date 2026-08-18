export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { ContactMessage } from "@/lib/supabase";
import MarkReadButton from "./MarkReadButton";
import DeleteMessageButton from "./DeleteMessageButton";

async function getMessages(): Promise<ContactMessage[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as ContactMessage[]) ?? [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal font-display">
            Contact Messages
          </h1>
          {unread > 0 && (
            <p className="text-sm text-gold mt-1">{unread} unread</p>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 text-muted">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white border p-5 ${
                !msg.is_read ? "border-gold/40" : "border-charcoal/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    )}
                    <span className="font-semibold text-charcoal">{msg.name}</span>
                    {msg.subject && (
                      <span className="text-sm text-muted">&mdash; {msg.subject}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted mb-2">
                    <a href={`mailto:${msg.email}`} className="hover:text-charcoal transition-colors">
                      {msg.email}
                    </a>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{msg.message}</p>
                  <p className="text-xs text-muted mt-2">{formatDate(msg.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!msg.is_read && <MarkReadButton id={msg.id} />}
                  <DeleteMessageButton id={msg.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
