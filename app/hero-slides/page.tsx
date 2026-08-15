"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, GraduationCap } from "lucide-react";

type Slide = {
  _id: string;
  badge: string;
  titleLine1: string;
  highlight: string;
  titleLine2: string;
  bgImage: string;
  order: number;
};

const emptyForm = { badge: "", titleLine1: "", highlight: "", titleLine2: "", order: 0 };

const degrees = [
  {
    title: "Bachelor of Medicine",
    desc: "A degree focusing on the study of human biology, anatomy, and pathology to build a strong medical foundation.",
  },
  {
    title: "Bachelor of Surgery",
    desc: "A degree emphasizing clinical and surgical skills for diagnosing and treating patients effectively.",
  },
];

// Exact structural + class match of client-site/components/HeroSection.tsx,
// scaled down to fit an admin preview panel. Same markup, same Tailwind classes.
function HeroPreview({
  badge,
  titleLine1,
  highlight,
  titleLine2,
  imagePreviewUrl,
}: {
  badge: string;
  titleLine1: string;
  highlight: string;
  titleLine2: string;
  imagePreviewUrl: string | null;
}) {
  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Live Preview — exact client layout</p>

      <div className="relative w-full aspect-[1400/700] overflow-hidden text-white font-sans bg-gray-900 rounded-lg">
        {/* Background */}
        {imagePreviewUrl ? (
          <Image src={imagePreviewUrl} alt="preview" fill className="object-cover object-center" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        <div className="absolute inset-0 bg-black/10" />

        {/* Top pagination bar — matches HeroSection exactly, static preview (single slide = "01") */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 pt-6 flex items-center justify-between text-[9px] tracking-widest font-semibold uppercase">
          <span className="text-gray-200">PREV</span>
          <div className="flex-1 max-w-md mx-8 flex items-center justify-center gap-4 border-t border-white/30 pt-1">
            <span className="text-[#facc15] font-bold text-xs">01</span>
          </div>
          <span className="text-gray-200">NEXT</span>
        </div>

        {/* Frosted overlay content block */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 h-[calc(100%-56px)] flex items-end pb-6">
          <div className="w-full bg-[#0a3d24]/35 backdrop-blur-[3px] border border-white/20 rounded-sm p-4 md:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row w-full items-end justify-between gap-4">
              {/* Left content */}
              <div className="max-w-md">
                <p className="flex items-center gap-1.5 text-[10px] mb-2 text-gray-100 font-normal tracking-wide">
                  <GraduationCap size={12} className="text-white shrink-0" />
                  {badge || "Badge text goes here"}
                </p>

                <h1 className="text-lg md:text-xl leading-[1.15] mb-3 font-serif text-white tracking-tight">
                  <span className="font-bold">{titleLine1 || "Title line 1"}</span>{" "}
                  <span className="font-serif italic text-white">in Medical</span>
                  <br />
                  <span className="font-serif italic text-[#facc15] font-semibold">
                    {highlight || "highlight"}
                  </span>
                  <span className="font-serif">, {titleLine2 || "title line 2"}</span>
                </h1>

                <button
                  type="button"
                  className="bg-white text-[#0a3d24] font-semibold text-[9px] tracking-wider uppercase px-3 py-2 rounded-sm inline-flex items-center gap-1.5 shadow-md pointer-events-none"
                >
                  View Our Program <ArrowRight size={10} />
                </button>
              </div>

              {/* Right: MBBS Degrees */}
              <div className="hidden lg:block w-40 shrink-0">
                <h3 className="text-[#facc15] text-sm font-serif font-bold mb-2">MBBS Degrees</h3>
                <div className="space-y-2">
                  {degrees.map((d) => (
                    <div key={d.title} className="border-t border-white/25 pt-1.5">
                      <p className="font-serif text-[10px] text-white font-medium">{d.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Scaled-down mirror of the real homepage hero — same layout, fonts, and colors as the live site.
      </p>
    </div>
  );
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hero-slides");
      const json = await res.json();
      if (json.success) setSlides(json.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load slides: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setImagePreviewUrl(null);
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
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
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
    setImagePreviewUrl(slide.bgImage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json?.success) fetchSlides();
    else setErrorMsg(json?.error || "Delete failed");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Hero Slides</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8 mb-10">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
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
                placeholder="Innovation in Healthcare"
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

        <HeroPreview
          badge={form.badge}
          titleLine1={form.titleLine1}
          highlight={form.highlight}
          titleLine2={form.titleLine2}
          imagePreviewUrl={imagePreviewUrl}
        />
      </div>

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
