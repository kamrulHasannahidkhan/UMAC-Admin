"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Testimonial = { _id: string; rating: number; quote: string; name: string; role: string; avatar: string; order: number };
type Content = { _id: string; heading: string; subheading: string };

const emptyContentForm = { heading: "", subheading: "" };
const emptyItemForm = { rating: 5, quote: "", name: "", role: "", order: 0 };

export default function TestimonialsAdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [contentSaving, setContentSaving] = useState(false);

  const [items, setItems] = useState<Testimonial[]>([]);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemSaving, setItemSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contentRes, listRes] = await Promise.all([
        fetch("/api/testimonials").then((r) => r.json()),
        fetch("/api/testimonials-list").then((r) => r.json()),
      ]);
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
        setContentForm({ heading: contentRes.data.heading, subheading: contentRes.data.subheading });
      }
      if (listRes.success) setItems(listRes.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setContentSaving(true);
    const method = content ? "PUT" : "POST";
    try {
      const res = await fetch("/api/testimonials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm),
      });
      const json = await res.json();
      if (json.success) fetchAll();
      else setErrorMsg(json.error || "Failed to save");
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setContentSaving(false);
  };

  const resetItemForm = () => {
    setItemForm(emptyItemForm);
    setAvatarFile(null);
    setEditingId(null);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingId && !avatarFile) {
      alert("Please choose an avatar image for a new testimonial.");
      return;
    }

    setItemSaving(true);
    const formData = new FormData();
    Object.entries(itemForm).forEach(([key, value]) => formData.append(key, String(value)));
    if (avatarFile) formData.append("avatar", avatarFile);

    const url = editingId ? `/api/testimonials-list/${editingId}` : "/api/testimonials-list";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetItemForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save testimonial");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setItemSaving(false);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingId(t._id);
    setItemForm({ rating: t.rating, quote: t.quote, name: t.name, role: t.role, order: t.order });
    setAvatarFile(null);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/testimonials-list/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) fetchAll();
    else setErrorMsg(json.error || "Delete failed");
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Testimonials</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <form onSubmit={handleContentSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">Heading & Subheading</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Heading</label>
              <input type="text" required value={contentForm.heading} onChange={(e) => setContentForm({ ...contentForm, heading: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="My Students Feedback" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subheading</label>
              <input type="text" required value={contentForm.subheading} onChange={(e) => setContentForm({ ...contentForm, subheading: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="You'll find something to spark your curiosity and enhance" />
            </div>
            <button type="submit" disabled={contentSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {contentSaving ? "Saving..." : content ? "Update" : "Create"}
            </button>
          </form>

          <form onSubmit={handleItemSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input type="number" min={1} max={5} required value={itemForm.rating} onChange={(e) => setItemForm({ ...itemForm, rating: Number(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input type="number" value={itemForm.order} onChange={(e) => setItemForm({ ...itemForm, order: Number(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quote</label>
              <textarea required rows={3} value={itemForm.quote} onChange={(e) => setItemForm({ ...itemForm, quote: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" required value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Emma Elizabeth" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input type="text" required value={itemForm.role} onChange={(e) => setItemForm({ ...itemForm, role: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Assistant Teacher" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Avatar {editingId && "(leave empty to keep current)"}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={itemSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {itemSaving ? "Saving..." : editingId ? "Update Testimonial" : "Add Testimonial"}
              </button>
              {editingId && (
                <button type="button" onClick={resetItemForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2 className="font-medium text-lg mb-4">All Testimonials</h2>
          <div className="space-y-3">
            {items.map((t) => (
              <div key={t._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-gray-100">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t.name} <span className="text-xs text-gray-400">· {t.role}</span></p>
                  <p className="text-sm text-gray-500 truncate">{t.quote}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(t)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(t._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-gray-400">No testimonials yet — add one above.</p>}
          </div>
        </>
      )}
    </main>
  );
}
