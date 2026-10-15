"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FAQ } from "@/lib/supabase";

type Props = {
  initialFAQs: FAQ[];
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function FAQsAdmin({ initialFAQs }: Props) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFAQs);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");

  // Form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [sortOrder, setSortOrder] = useState(0);

  // Get unique categories
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  function resetForm() {
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
  }

  function editFAQ(f: FAQ) {
    setQuestion(f.question);
    setAnswer(f.answer);
    setCategory(f.category);
    setSortOrder(f.sort_order);
    setEditingId(f.id);
    setShowForm(true);
  }

  async function saveFAQ() {
    const payload = {
      question,
      answer,
      category,
      sort_order: sortOrder,
    };

    const endpoint = editingId
      ? `/api/admin/faqs/${editingId}`
      : "/api/admin/faqs";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setFaqs((prev) => prev.map((f) => (f.id === editingId ? data : f)));
      } else {
        setFaqs((prev) => [...prev, data]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deleteFAQ(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      router.refresh();
    }
  }

  const filtered = filterCategory === "all" ? faqs : faqs.filter((f) => f.category === filterCategory);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">FAQs</h1>
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                filterCategory === "all" ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  filterCategory === cat ? "bg-gold text-charcoal" : "text-muted-dark hover:text-off-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => { resetForm(); setShowForm(true); }}
        className="mb-4 px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
      >
        + Add FAQ
      </button>

      {showForm && (
        <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category *" className={inputClass} />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="Sort Order" className={inputClass} />
          </div>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question *" className={inputClass} />
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer *" rows={4} className={inputClass} />
          <div className="flex gap-2">
            <button onClick={saveFAQ} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((f) => (
          <div key={f.id} className="bg-white/5 border border-off-white/10 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-off-white block">{f.question}</span>
                <span className="text-xs text-muted-dark mt-1 block line-clamp-1">{f.answer}</span>
                <span className="text-xs text-gold mt-1 block">{f.category}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0 pt-0.5">
                <button onClick={() => editFAQ(f)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                  Edit
                </button>
                <button onClick={() => deleteFAQ(f.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-dark py-4">No FAQs yet.</p>
        )}
      </div>
    </div>
  );
}
