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
  accessibility: "Accessibility Statement",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

const DEFAULT_PRIVACY_POLICY = `<h2>Information We Collect</h2>
<p>When you visit our website, purchase tickets, or interact with our services, we may collect the following types of information:</p>
<ul>
  <li><strong>Personal Information:</strong> Name, email address, phone number, and billing address when you purchase tickets, sign up for classes, or contact us.</li>
  <li><strong>Payment Information:</strong> Credit card and payment details are processed securely through our third-party payment processors. We do not store full payment card details on our servers.</li>
  <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent on pages, and referring URLs.</li>
  <li><strong>Device Information:</strong> Browser type, operating system, and device type used to access our website.</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the information we collect for the following purposes:</p>
<ul>
  <li><strong>Order Fulfillment:</strong> To process ticket purchases, gift cards, merchandise orders, and class registrations.</li>
  <li><strong>Communication:</strong> To send order confirmations, event updates, and respond to inquiries you submit through our contact form.</li>
  <li><strong>Website Improvement:</strong> To analyze usage patterns and improve our website's functionality and user experience.</li>
  <li><strong>Marketing:</strong> With your consent, to send promotional materials about upcoming shows and events. You can opt out at any time.</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
<ul>
  <li><strong>Service Providers:</strong> Third-party companies that help us operate our website, process payments, and deliver services (e.g., payment processors, email service providers).</li>
  <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
</ul>

<h2>Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

<h2>Cookies</h2>
<p>Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us remember your preferences and understand how you use our site. You can control cookie settings through your browser preferences.</p>

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Access the personal information we hold about you</li>
  <li>Request correction of inaccurate information</li>
  <li>Request deletion of your personal information</li>
  <li>Opt out of marketing communications</li>
  <li>Withdraw consent for data processing where applicable</li>
</ul>

<h2>Children's Privacy</h2>
<p>Our website is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us so we can promptly remove it.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>

<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy or how we handle your personal information, please contact us through our website's contact form or email us directly.</p>`;

type GroupedContent = Record<string, PageContent[]>;

const isLegalContent = (key: string) =>
  key === "accessibility" || key === "terms" || key === "privacy";

export default function ContentEditorForm({ initial }: { initial: PageContent[] }) {
  const grouped: GroupedContent = {};
  initial.forEach((item) => {
    if (!grouped[item.page_key]) grouped[item.page_key] = [];
    grouped[item.page_key].push(item);
  });

  // Pre-fill privacy policy with default content if the section exists but is empty
  if (grouped["privacy"]) {
    grouped["privacy"] = grouped["privacy"].map((item) =>
      item.section_key === "statement" && !item.content
        ? { ...item, content: DEFAULT_PRIVACY_POLICY }
        : item
    );
  }

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
        const isLegal = isLegalContent(pageKey);

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
                {isLegal && (
                  <p className="text-xs text-muted pt-4 leading-relaxed">
                    Content is stored as HTML and rendered in the footer popup. Edit the HTML below to update the statement text.
                  </p>
                )}
                {items.length === 0 && (
                  <p className="text-xs text-muted pt-4">No content sections found for this page.</p>
                )}
                {items.map((item) => (
                  <div key={item.section_key} className="pt-4">
                    <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">
                      {item.section_key.replace(/_/g, " ")}
                    </label>
                    <textarea
                      rows={isLegal ? 20 : 3}
                      maxLength={isLegal ? 50000 : 5000}
                      value={item.content}
                      onChange={(e) => updateContent(pageKey, item.section_key, e.target.value)}
                      className={`${inputClass} ${isLegal ? "resize-y" : "resize-none"}`}
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
