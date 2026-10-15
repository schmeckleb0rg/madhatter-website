"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  body: string;
  author_name: string | null;
  category: string;
  publish_date: string;
  is_published: boolean;
  created_at: string;
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function BlogAdmin({ initialPosts }: { initialPosts: BlogPost[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("general");
  const [publishDate, setPublishDate] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  function generateSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function resetForm() {
    setTitle("");
    setSlug("");
    setCoverImageUrl("");
    setBody("");
    setAuthorName("");
    setCategory("general");
    setPublishDate("");
    setIsPublished(false);
    setEditingId(null);
    setShowForm(false);
  }

  function editPost(p: BlogPost) {
    setTitle(p.title);
    setSlug(p.slug);
    setCoverImageUrl(p.cover_image_url || "");
    setBody(p.body);
    setAuthorName(p.author_name || "");
    setCategory(p.category);
    setPublishDate(p.publish_date ? p.publish_date.split("T")[0] : "");
    setIsPublished(p.is_published);
    setEditingId(p.id);
    setShowForm(true);
  }

  async function savePost() {
    const payload = {
      title,
      slug: slug || generateSlug(title),
      cover_image_url: coverImageUrl || "",
      body,
      author_name: authorName || null,
      category,
      publish_date: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
      is_published: isPublished,
    };

    const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setPosts((prev) => prev.map((p) => (p.id === editingId ? data : p)));
      } else {
        setPosts((prev) => [data, ...prev]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  async function togglePublish(p: BlogPost) {
    const res = await fetch(`/api/admin/blog/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, is_published: !p.is_published }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => prev.map((post) => (post.id === p.id ? data : post)));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Blog</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
        >
          + New Post
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingId) setSlug(generateSlug(e.target.value));
              }}
              placeholder="Post Title *"
              className={inputClass}
            />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (auto-generated)" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author Name" className={inputClass} />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={inputClass} />
            <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className={inputClass} />
          </div>
          <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="Cover Image URL" className={inputClass} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Post body (HTML supported)"
            rows={12}
            className={inputClass + " font-mono text-xs"}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-off-white">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Published
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={savePost} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-white/5 border border-off-white/10 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-off-white">{p.title}</span>
              <span className="ml-2 text-xs text-gold">{p.category}</span>
              <span className={`ml-2 text-xs ${p.is_published ? "text-green-400" : "text-amber-400"}`}>
                {p.is_published ? "Published" : "Draft"}
              </span>
              <span className="ml-2 text-xs text-muted-dark">
                {new Date(p.publish_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => togglePublish(p)} className="text-xs text-gold hover:text-gold/80 transition-colors">
                {p.is_published ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => editPost(p)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                Edit
              </button>
              <button onClick={() => deletePost(p.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-muted-dark py-4">No blog posts yet.</p>
        )}
      </div>
    </div>
  );
}
