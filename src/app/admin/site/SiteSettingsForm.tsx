"use client";

import { useState, useRef } from "react";

type Settings = Record<string, string | undefined>;

export default function SiteSettingsForm({ initial }: { initial: Settings }) {
  const [seo, setSeo] = useState({
    seo_title: initial.seo_title ?? "",
    seo_description: initial.seo_description ?? "",
    seo_keywords: initial.seo_keywords ?? "",
    og_title: initial.og_title ?? "",
    og_description: initial.og_description ?? "",
  });
  const [seoStatus, setSeoStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [venue, setVenue] = useState({
    venue_street: initial.venue_street ?? "",
    venue_city: initial.venue_city ?? "",
    venue_state: initial.venue_state ?? "",
    venue_zip: initial.venue_zip ?? "",
    venue_phone: initial.venue_phone ?? "",
    venue_email: initial.venue_email ?? "",
    venue_events_email: initial.venue_events_email ?? "",
    venue_merch_email: initial.venue_merch_email ?? "",
    venue_map_lat: initial.venue_map_lat ?? "",
    venue_map_lng: initial.venue_map_lng ?? "",
    hours_mon_thu: initial.hours_mon_thu ?? "",
    hours_fri_sat: initial.hours_fri_sat ?? "",
    hours_sun: initial.hours_sun ?? "",
  });
  const [venueStatus, setVenueStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [social, setSocial] = useState({
    social_instagram: initial.social_instagram ?? "",
    social_tiktok: initial.social_tiktok ?? "",
    social_facebook: initial.social_facebook ?? "",
    social_youtube: initial.social_youtube ?? "",
  });
  const [socialStatus, setSocialStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [faviconUrl, setFaviconUrl] = useState(initial.favicon_url ?? "");
  const [faviconStatus, setFaviconStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const faviconRef = useRef<HTMLInputElement>(null);

  const [bgUrl, setBgUrl] = useState(initial.background_url ?? "");
  const [bgStatus, setBgStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const bgRef = useRef<HTMLInputElement>(null);

  const [ogImageUrl, setOgImageUrl] = useState(initial.og_image_url ?? "");
  const [ogImageStatus, setOgImageStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const ogImageRef = useRef<HTMLInputElement>(null);

  const [appIconUrl, setAppIconUrl] = useState(initial.app_icon_url ?? "");
  const [appIconStatus, setAppIconStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const appIconRef = useRef<HTMLInputElement>(null);

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

  async function saveVenue() {
    setVenueStatus("saving");
    const res = await fetch("/api/admin/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venue),
    });
    setVenueStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setVenueStatus("idle"), 2000);
  }

  async function saveSocial() {
    setSocialStatus("saving");
    const res = await fetch("/api/admin/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(social),
    });
    setSocialStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setSocialStatus("idle"), 2000);
  }

  async function uploadFile(file: File, type: "favicon" | "background" | "og_image" | "app_icon") {
    const setStatus = type === "favicon" ? setFaviconStatus : type === "og_image" ? setOgImageStatus : type === "app_icon" ? setAppIconStatus : setBgStatus;
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/admin/site/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        if (type === "favicon") setFaviconUrl(url);
        else if (type === "og_image") setOgImageUrl(url);
        else if (type === "app_icon") setAppIconUrl(url);
        else setBgUrl(url);
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        const data = await res.json();
        alert(data.error ?? "Upload failed.");
        setStatus("error");
      }
    } catch {
      alert("Connection error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-8">

      {/* Venue Address & Contact */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-charcoal">Venue Address & Contact</h2>
            <p className="text-xs text-muted mt-0.5">Updates the address, phone, email, and hours shown across the site.</p>
          </div>
          <button
            onClick={saveVenue}
            disabled={venueStatus === "saving"}
            className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {venueStatus === "saving" ? "Saving..." : venueStatus === "saved" ? "Saved" : "Save"}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Street Address</label>
            <input type="text" maxLength={200} value={venue.venue_street}
              onChange={(e) => setVenue({ ...venue, venue_street: e.target.value })} className={inputClass}
              placeholder="123 W Madison St" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">City</label>
              <input type="text" maxLength={100} value={venue.venue_city}
                onChange={(e) => setVenue({ ...venue, venue_city: e.target.value })} className={inputClass}
                placeholder="Chicago" />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">State</label>
              <input type="text" maxLength={50} value={venue.venue_state}
                onChange={(e) => setVenue({ ...venue, venue_state: e.target.value })} className={inputClass}
                placeholder="IL" />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Zip</label>
              <input type="text" maxLength={20} value={venue.venue_zip}
                onChange={(e) => setVenue({ ...venue, venue_zip: e.target.value })} className={inputClass}
                placeholder="60602" />
            </div>
          </div>

          <div className="border-t border-charcoal/10 pt-4">
            <p className="text-xs text-muted mb-3">Contact Information</p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Phone</label>
                  <input type="text" maxLength={30} value={venue.venue_phone}
                    onChange={(e) => setVenue({ ...venue, venue_phone: e.target.value })} className={inputClass}
                    placeholder="(312) 555-0100" />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">General Email</label>
                  <input type="text" maxLength={200} value={venue.venue_email}
                    onChange={(e) => setVenue({ ...venue, venue_email: e.target.value })} className={inputClass}
                    placeholder="hello@madhattercomedy.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Events Email</label>
                  <input type="text" maxLength={200} value={venue.venue_events_email}
                    onChange={(e) => setVenue({ ...venue, venue_events_email: e.target.value })} className={inputClass}
                    placeholder="events@madhattercomedy.com" />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Merch Email</label>
                  <input type="text" maxLength={200} value={venue.venue_merch_email}
                    onChange={(e) => setVenue({ ...venue, venue_merch_email: e.target.value })} className={inputClass}
                    placeholder="merch@madhattercomedy.com" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-charcoal/10 pt-4">
            <p className="text-xs text-muted mb-3">Map Coordinates (for Google Maps embed & structured data)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Latitude</label>
                <input type="text" maxLength={20} value={venue.venue_map_lat}
                  onChange={(e) => setVenue({ ...venue, venue_map_lat: e.target.value })} className={inputClass}
                  placeholder="41.8819" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Longitude</label>
                <input type="text" maxLength={20} value={venue.venue_map_lng}
                  onChange={(e) => setVenue({ ...venue, venue_map_lng: e.target.value })} className={inputClass}
                  placeholder="-87.6318" />
              </div>
            </div>
          </div>

          <div className="border-t border-charcoal/10 pt-4">
            <p className="text-xs text-muted mb-3">Business Hours</p>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Mon - Thu</label>
                <input type="text" maxLength={50} value={venue.hours_mon_thu}
                  onChange={(e) => setVenue({ ...venue, hours_mon_thu: e.target.value })} className={inputClass}
                  placeholder="6 PM – 11 PM" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Fri - Sat</label>
                <input type="text" maxLength={50} value={venue.hours_fri_sat}
                  onChange={(e) => setVenue({ ...venue, hours_fri_sat: e.target.value })} className={inputClass}
                  placeholder="6 PM – 1 AM" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Sunday</label>
                <input type="text" maxLength={50} value={venue.hours_sun}
                  onChange={(e) => setVenue({ ...venue, hours_sun: e.target.value })} className={inputClass}
                  placeholder="5 PM – 10 PM" />
              </div>
            </div>
          </div>
        </div>
        {venueStatus === "error" && <p className="text-xs mt-3" style={{ color: "#9C4A38" }}>Failed to save.</p>}
      </div>

      {/* Social Media Links */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-charcoal">Social Media Links</h2>
            <p className="text-xs text-muted mt-0.5">Leave blank to hide the button on the public site.</p>
          </div>
          <button
            onClick={saveSocial}
            disabled={socialStatus === "saving"}
            className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {socialStatus === "saving" ? "Saving..." : socialStatus === "saved" ? "Saved" : "Save"}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Instagram URL</label>
            <input type="text" maxLength={500} value={social.social_instagram}
              onChange={(e) => setSocial({ ...social, social_instagram: e.target.value })} className={inputClass}
              placeholder="https://instagram.com/madhattercomedy" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">TikTok URL</label>
            <input type="text" maxLength={500} value={social.social_tiktok}
              onChange={(e) => setSocial({ ...social, social_tiktok: e.target.value })} className={inputClass}
              placeholder="https://tiktok.com/@madhattercomedy" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">Facebook URL</label>
            <input type="text" maxLength={500} value={social.social_facebook}
              onChange={(e) => setSocial({ ...social, social_facebook: e.target.value })} className={inputClass}
              placeholder="https://facebook.com/madhattercomedy" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1.5">YouTube URL</label>
            <input type="text" maxLength={500} value={social.social_youtube}
              onChange={(e) => setSocial({ ...social, social_youtube: e.target.value })} className={inputClass}
              placeholder="https://youtube.com/@madhattercomedy" />
          </div>
        </div>
        {socialStatus === "error" && <p className="text-xs mt-3" style={{ color: "#9C4A38" }}>Failed to save.</p>}
      </div>

      {/* SEO & OG Tags */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-charcoal">SEO & Open Graph</h2>
            <p className="text-xs text-muted mt-0.5">Controls browser tab title, search results, and link previews.</p>
          </div>
          <button
            onClick={saveSeo}
            disabled={seoStatus === "saving"}
            className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors w-full sm:w-auto"
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
                <p className="text-xs text-muted mb-3">1200x630px, JPG or PNG recommended.</p>
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
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <h2 className="text-base font-bold text-charcoal mb-1">Favicon / Browser Icon</h2>
        <p className="text-xs text-muted mb-5">32x32px or 64x64px, ICO or PNG recommended.</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
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

      {/* App Logo (Home Screen Icon) */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <h2 className="text-base font-bold text-charcoal mb-1">App Logo (Home Screen Icon)</h2>
        <p className="text-xs text-muted mb-5">The icon shown when users save your site to their phone home screen. 512x512px square PNG recommended.</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="w-16 h-16 border border-charcoal/10 bg-off-white flex items-center justify-center flex-shrink-0 overflow-hidden rounded-xl">
            {appIconUrl
              ? <img src={appIconUrl} alt="app icon" className="w-14 h-14 object-contain" />
              : <span className="text-muted text-xs">None</span>}
          </div>
          <div className="flex-1">
            <input ref={appIconRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "app_icon"); }} />
            <button
              onClick={() => appIconRef.current?.click()}
              disabled={appIconStatus === "uploading"}
              className="text-xs px-4 py-2 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal disabled:opacity-50 transition-colors"
            >
              {appIconStatus === "uploading" ? "Uploading..." : appIconStatus === "done" ? "Uploaded" : "Upload App Icon"}
            </button>
            {appIconUrl && <p className="text-xs text-muted mt-1.5 truncate">{appIconUrl}</p>}
          </div>
        </div>
      </div>

      {/* Coming Soon Background */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <h2 className="text-base font-bold text-charcoal mb-1">Coming Soon Background</h2>
        <p className="text-xs text-muted mb-5">1920x1080px recommended. SVG, PNG, JPG, or WEBP.</p>
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
