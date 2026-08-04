"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BannerContent = {
  _id: string;
  titlePlain: string;
  titleHighlight: string;
  description: string;
  buttonText: string;
  bgImage: string;
};

const emptyForm = {
  titlePlain: "",
  titleHighlight: "",
  description: "",
  buttonText: "",
};

export default function PageBannerAdminPage() {
  const [content, setContent] = useState<BannerContent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/page-banner");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success && json.data) {
        setContent(json.data);
        setForm({
          titlePlain: json.data.titlePlain,
          titleHighlight: json.data.titleHighlight,
          description: json.data.description,
          buttonText: json.data.buttonText,
        });
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

    if (!content && !bgImage) {
      alert("Please choose a background image for first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("titlePlain", form.titlePlain);
    formData.append("titleHighlight", form.titleHighlight);
    formData.append("description", form.description);
    formData.append("buttonText", form.buttonText);
    if (bgImage) formData.append("bgImage", bgImage);

    const method = content ? "PUT" : "POST";

    try {
      const res = await fetch("/api/page-banner", { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) {
        setBgImage(null);
        fetchContent();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Page Banner (e.g. Admission)</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title (highlight)</label>
              <input
                type="text"
                required
                value={form.titleHighlight}
                onChange={(e) => setForm({ ...form, titleHighlight: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="UAMC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title (plain)</label>
              <input
                type="text"
                required
                value={form.titlePlain}
                onChange={(e) => setForm({ ...form, titlePlain: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Admission"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Button text</label>
            <input
              type="text"
              required
              value={form.buttonText}
              onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Learn More"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Background image {content && "(leave empty to keep current)"}
            </label>
            {content?.bgImage && (
              <div className="relative w-full h-32 mb-2 rounded overflow-hidden bg-gray-100">
                <Image src={content.bgImage} alt="Current background" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : content ? "Update Banner" : "Create Banner"}
          </button>
        </form>
      )}
    </main>
  );
}
