"use client";

import { useState, useRef } from "react";

type Settings = {
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  favicon_url?: string;
  background_url?: string;
};

export default function SiteSettingsForm({ initial }: { initial: Settings }) {
  const [seo, setSeo] = useState({
    seo_title: initial.seo_title ?? "",
    seo_description: initial.seo_description ?? "",
    seo_keywords: initial.seo_keywords ?? "",
    og_title: initial.og_title ?? "",
    og_description: initial.og_description ?? "",
  });
  const [seoStatus, setSeoStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [faviconUrl, setFaviconUrl] = useState(initial.favicon_url ?? "");
  const [faviconStatus, setFaviconStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const faviconRef = useRef<HTMLInputElement>(null);

  const [bgUrl, setBgUrl] = useState(initial.background_url ?? "");
  const [bgStatus, setBgStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const bgRef = useRef<HTMLInputElement>(null);

  const [ogImageUrl, setOgImageUrl] = useState(initial.og_image_url ?? "");
  const [ogImageStatus, setOgImageStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const ogImageRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  async function saveSeo() {
    setSeoStatus("saving");
    const res = await fetch("/api/admin/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seo),
    });
    setSeoStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setSeoStatus("idle"), 2000);
  }

  async function uploadFile(file: File, type: "favicon" | "background" | "og_image") {
    const setStatus = type === "favicon" ? setFaviconStatus : type === "og_image" ? setOgImageStatus : setBgStatus;
    setStatus("uploading");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/admin/site/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      if (type === "favicon") setFaviconUrl(url);
      else if (type === "og_image") setOgImageUrl(url);
      else setBgUrl(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      const data = await res.json();
      alert(data.error ?? "Upload failed.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-8">

      {/* SEO & OG Tags */}
      <div className="bg-white border border-charcoal/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-charcoal">SEO & Open Graph</h2>
            <p className="text-xs text-muted mt-0.5">Controls browser tab title, search results, and link previews.</p>
          </div>
          <button
            onClick={saveSeo}
            disabled={seoStatus === "saving"}
            className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
          >
            {seoStatus === "saving" ? "Saving..." : seoStatus === "saved" ? "Saved" : "Save"}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Page Title</label>
            <input type="text" maxLength={200} value={seo.seo_title}
              onChange={(e) => setSeo({ ...seo, seo_title: e.target.value })} className={inputClass}
              placeholder="Mad Hatter Comedy Club | Chicago" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Meta Description</label>
            <textarea rows={2} maxLength={500} value={seo.seo_description}
              onChange={(e) => setSeo({ ...seo, seo_description: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Chicago's premier comedy club..." />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Keywords</label>
            <input type="text" maxLength={500} value={seo.seo_keywords}
              onChange={(e) => setSeo({ ...seo, seo_keywords: e.target.value })} className={inputClass}
              placeholder="comedy club, Chicago, stand-up..." />
          </div>
          <div className="border-t border-charcoal/10 pt-4">
            <p className="text-xs text-muted mb-3">Open Graph (link previews on social media / iMessage)</p>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">OG Title</label>
                <input type="text" maxLength={200} value={seo.og_title}
                  onChange={(e) => setSeo({ ...seo, og_title: e.target.value })} className={inputClass}
                  placeholder="Same as page title if blank" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">OG Description</label>
                <input type="text" maxLength={500} value={seo.og_description}
                  onChange={(e) => setSeo({ ...seo, og_description: e.target.value })} className={inputClass}
                  placeholder="Same as meta description if blank" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">OG Image (iMessage / Social Preview)</label>
                <p className="text-xs text-muted mb-3">The image shown when sharing your link on iMessage, Twitter, Slack, etc. PNG or JPG, 1200x630px recommended.</p>
                {ogImageUrl && (
                  <div className="border border-charcoal/10 overflow-hidden bg-off-white-2 mb-3" style={{ height: 120 }}>
                    <img src={ogImageUrl} alt="OG image preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input ref={ogImageRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "og_image"); }} />
                <button
                  onClick={() => ogImageRef.current?.click()}
                  disabled={ogImageStatus === "uploading"}
                  className="text-xs px-4 py-2 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal disabled:opacity-50 transition-colors"
                >
                  {ogImageStatus === "uploading" ? "Uploading..." : ogImageStatus === "done" ? "Uploaded" : "Upload OG Image"}
                </button>
                {ogImageUrl && <p className="text-xs text-muted mt-1.5 truncate">{ogImageUrl}</p>}
              </div>
            </div>
          </div>
        </div>
        {seoStatus === "error" && <p className="text-xs mt-3" style={{ color: "#9C4A38" }}>Failed to save.</p>}
      </div>

      {/* Favicon */}
      <div className="bg-white border border-charcoal/10 p-6">
        <h2 className="text-base font-bold text-charcoal mb-1">Favicon / Browser Icon</h2>
        <p className="text-xs text-muted mb-5">The small icon shown in browser tabs. PNG or ICO recommended, 32x32px ideal.</p>
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 border border-charcoal/10 bg-off-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            {faviconUrl
              ? <img src={faviconUrl} alt="favicon" className="w-8 h-8 object-contain" />
              : <span className="text-muted text-xs">None</span>}
          </div>
          <div className="flex-1">
            <input ref={faviconRef} type="file" accept="image/*,.ico" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "favicon"); }} />
            <button
              onClick={() => faviconRef.current?.click()}
              disabled={faviconStatus === "uploading"}
              className="text-xs px-4 py-2 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal disabled:opacity-50 transition-colors"
            >
              {faviconStatus === "uploading" ? "Uploading..." : faviconStatus === "done" ? "Uploaded" : "Upload New Favicon"}
            </button>
            {faviconUrl && <p className="text-xs text-muted mt-1.5 truncate">{faviconUrl}</p>}
          </div>
        </div>
      </div>

      {/* Coming Soon Background */}
      <div className="bg-white border border-charcoal/10 p-6">
        <h2 className="text-base font-bold text-charcoal mb-1">Coming Soon Background</h2>
        <p className="text-xs text-muted mb-5">Replaces the current background image on the homepage. SVG, PNG, JPG, or WEBP.</p>
        <div className="space-y-4">
          {bgUrl && (
            <div className="border border-charcoal/10 overflow-hidden bg-off-white-2" style={{ height: 160 }}>
              <img src={bgUrl} alt="background preview" className="w-full h-full object-cover" />
            </div>
          )}
          {!bgUrl && (
            <div className="border border-dashed border-charcoal/10 bg-off-white flex items-center justify-center" style={{ height: 120 }}>
              <p className="text-xs text-muted">Using default coming-soon.svg</p>
            </div>
          )}
          <input ref={bgRef} type="file" accept="image/*,.svg" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "background"); }} />
          <button
            onClick={() => bgRef.current?.click()}
            disabled={bgStatus === "uploading"}
            className="text-xs px-4 py-2 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal disabled:opacity-50 transition-colors"
          >
            {bgStatus === "uploading" ? "Uploading..." : bgStatus === "done" ? "Uploaded" : "Upload New Background"}
          </button>
        </div>
      </div>

    </div>
  );
}
