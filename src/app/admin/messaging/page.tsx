export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import MessagingCenter from "./MessagingCenter";

export default async function AdminMessagingPage() {
  const db = getAdminClient();

  const [
    { data: subscribers },
    { data: templates },
    { data: queue },
  ] = await Promise.all([
    db.from("subscribers").select("*").eq("is_active", true).order("subscribed_at", { ascending: false }),
    db.from("email_templates").select("*").order("template_key"),
    db.from("email_queue").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">Messaging Center</h1>
        <p className="text-sm text-muted mt-1">Manage subscribers, email templates, and send communications.</p>
      </div>
      <MessagingCenter
        initialSubscribers={subscribers ?? []}
        initialTemplates={templates ?? []}
        initialQueue={queue ?? []}
      />
    </div>
  );
}
