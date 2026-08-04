"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Slide = {
  _id: string;
  badge: string;
  titleLine1: string;
  highlight: string;
  titleLine2: string;
  bgImage: string;
  order: number;
};

const emptyForm = {
  badge: "",
  titleLine1: "",
  highlight: "",
  titleLine2: "",
  order: 0,
};

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hero-slides");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) setSlides(json.data);
      else setErrorMsg(json?.error || `Failed to load slides (status ${res.status})`);
    } catch (err: any) {
      setErrorMsg(`Failed to load slides: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingId && !file) {
      alert("Please choose a background image for a new slide.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("badge", form.badge);
    formData.append("titleLine1", form.titleLine1);
    formData.append("highlight", form.highlight);
    formData.append("titleLine2", form.titleLine2);
    formData.append("order", String(form.order));
    if (file) formData.append("bgImage", file);

    const url = editingId ? `/api/hero-slides/${editingId}` : "/api/hero-slides";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (json?.success) {
        resetForm();
        fetchSlides();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status} with no error detail — check the terminal running "npm run dev".`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }

    setSaving(false);
  };

  const handleEdit = (slide: Slide) => {
    setEditingId(slide._id);
    setForm({
      badge: slide.badge,
      titleLine1: slide.titleLine1,
      highlight: slide.highlight,
      titleLine2: slide.titleLine2,
      order: slide.order,
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide? This also removes the image from Cloudinary.")) return;
    const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (json?.success) fetchSlides();
    else setErrorMsg(json?.error || `Delete failed (status ${res.status})`);
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Hero Slides</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-10 space-y-4">
        <h2 className="font-medium text-lg">{editingId ? "Edit Slide" : "Add New Slide"}</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Badge text</label>
          <input
            type="text"
            required
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Shaping the Future of Healthcare, One Student at a Time"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title (part 1)</label>
            <input
              type="text"
              required
              value={form.titleLine1}
              onChange={(e) => setForm({ ...form, titleLine1: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Excellence in Medical"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Highlight word</label>
            <input
              type="text"
              required
              value={form.highlight}
              onChange={(e) => setForm({ ...form, highlight: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Education"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title (part 2)</label>
            <input
              type="text"
              value={form.titleLine2}
              onChange={(e) => setForm({ ...form, titleLine2: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder=", Innovation in Healthcare"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Background image {editingId && "(leave empty to keep current)"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Slide" : "Add Slide"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Slides {loading && "(loading...)"}</h2>
      <div className="space-y-4">
        {slides.map((slide) => (
          <div key={slide._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative w-28 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
              <Image src={slide.bgImage} alt={slide.titleLine1} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Order: {slide.order}</p>
              <p className="font-medium truncate">
                {slide.titleLine1} <span className="text-yellow-600">{slide.highlight}</span>{slide.titleLine2}
              </p>
              <p className="text-sm text-gray-500 truncate">{slide.badge}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(slide)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">
                Edit
              </button>
              <button onClick={() => handleDelete(slide._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && slides.length === 0 && <p className="text-sm text-gray-400">No slides yet — add one above.</p>}
      </div>
    </main>
  );
}
