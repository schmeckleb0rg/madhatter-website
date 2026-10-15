"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PressArticle } from "@/lib/supabase";

type Props = {
  initialArticles: PressArticle[];
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function PressArticlesAdmin({ initialArticles }: Props) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [outletName, setOutletName] = useState("");
  const [headline, setHeadline] = useState("");
  const [url, setUrl] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [featuredQuote, setFeaturedQuote] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  function resetForm() {
    setOutletName("");
    setHeadline("");
    setUrl("");
    setPublicationDate("");
    setThumbnailUrl("");
    setFeaturedQuote("");
    setIsFeatured(false);
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
  }

  function editArticle(a: PressArticle) {
    setOutletName(a.outlet_name);
    setHeadline(a.headline);
    setUrl(a.url);
    setPublicationDate(a.publication_date || "");
    setThumbnailUrl(a.thumbnail_url || "");
    setFeaturedQuote(a.featured_quote || "");
    setIsFeatured(a.is_featured);
    setSortOrder(a.sort_order);
    setEditingId(a.id);
    setShowForm(true);
  }

  async function saveArticle() {
    const payload = {
      outlet_name: outletName,
      headline,
      url,
      publication_date: publicationDate || null,
      thumbnail_url: thumbnailUrl || null,
      featured_quote: featuredQuote || null,
      is_featured: isFeatured,
      sort_order: sortOrder,
    };

    const endpoint = editingId
      ? `/api/admin/press-articles/${editingId}`
      : "/api/admin/press-articles";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setArticles((prev) => prev.map((a) => (a.id === editingId ? data : a)));
      } else {
        setArticles((prev) => [...prev, data]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm("Delete this press article?")) return;
    const res = await fetch(`/api/admin/press-articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Press Articles</h1>
      </div>

      <button
        onClick={() => { resetForm(); setShowForm(true); }}
        className="mb-4 px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
      >
        + Add Article
      </button>

      {showForm && (
        <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={outletName} onChange={(e) => setOutletName(e.target.value)} placeholder="Outlet Name *" className={inputClass} />
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline *" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Article URL *" className={inputClass} />
            <input type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Thumbnail URL" className={inputClass} />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="Sort Order" className={inputClass} />
          </div>
          <textarea value={featuredQuote} onChange={(e) => setFeaturedQuote(e.target.value)} placeholder="Featured Quote" rows={2} className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-off-white">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured (pinned at top of press page)
          </label>
          <div className="flex gap-2">
            <button onClick={saveArticle} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {articles.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-white/5 border border-off-white/10 px-4 py-3">
            <div className="min-w-0">
              <span className="text-sm font-medium text-off-white truncate block">{a.headline}</span>
              <span className="text-xs text-gold">{a.outlet_name}</span>
              {a.publication_date && (
                <span className="ml-2 text-xs text-muted-dark">
                  {new Date(a.publication_date).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {a.is_featured && (
                <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold">Featured</span>
              )}
              <button onClick={() => editArticle(a)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                Edit
              </button>
              <button onClick={() => deleteArticle(a.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-muted-dark py-4">No press articles yet.</p>
        )}
      </div>
    </div>
  );
}
