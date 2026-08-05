"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Content = { _id: string; headingPlain: string; headingHighlight: string; description: string; image: string };

export default function SustainabilityAdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [form, setForm] = useState({ headingPlain: "", headingHighlight: "", description: "" });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sustainability");
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);
        setForm({ headingPlain: json.data.headingPlain, headingHighlight: json.data.headingHighlight, description: json.data.description });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!content && !image) {
      alert("Please choose an image for first-time setup.");
      return;
    }
    setSaving(true);
    const formData = new FormData();
    formData.append("headingPlain", form.headingPlain);
    formData.append("headingHighlight", form.headingHighlight);
    formData.append("description", form.description);
    if (image) formData.append("image", image);
    const method = content ? "PUT" : "POST";
    try {
      const res = await fetch("/api/sustainability", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setImage(null);
        fetchContent();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Sustainability at UAMC (About Overview)</h1>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Heading (plain)" value={form.headingPlain} onChange={(e) => setForm({ ...form, headingPlain: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
            <input type="text" required placeholder="Heading (highlight)" value={form.headingHighlight} onChange={(e) => setForm({ ...form, headingHighlight: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <textarea required rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          {content?.image && (
            <div className="relative w-full h-32 rounded overflow-hidden bg-gray-100">
              <Image src={content.image} alt="Current" fill className="object-cover" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : content ? "Update" : "Create"}
          </button>
        </form>
      )}
    </main>
  );
}
