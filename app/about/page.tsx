

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type AboutContent = {
  _id: string;
  badge: string;
  headingPlain: string;
  headingHighlight: string;
  paragraph1: string;
  paragraph2: string;
  image1: string;
  image2: string;
};

const emptyForm = {
  badge: "",
  headingPlain: "",
  headingHighlight: "",
  paragraph1: "",
  paragraph2: "",
};

export default function AboutAdminPage() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success && json.data) {
        setAbout(json.data);
        setForm({
          badge: json.data.badge,
          headingPlain: json.data.headingPlain,
          headingHighlight: json.data.headingHighlight,
          paragraph1: json.data.paragraph1,
          paragraph2: json.data.paragraph2,
        });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load About section: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!about && (!image1 || !image2)) {
      alert("Please choose both images for the first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("badge", form.badge);
    formData.append("headingPlain", form.headingPlain);
    formData.append("headingHighlight", form.headingHighlight);
    formData.append("paragraph1", form.paragraph1);
    formData.append("paragraph2", form.paragraph2);
    if (image1) formData.append("image1", image1);
    if (image2) formData.append("image2", image2);

    const method = about ? "PUT" : "POST";

    try {
      const res = await fetch("/api/about", { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (json?.success) {
        setImage1(null);
        setImage2(null);
        fetchAbout();
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
      <h1 className="text-2xl font-semibold mb-6">About Section</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Badge text</label>
            <input
              type="text"
              required
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="knowledge meets innovation"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heading (plain)</label>
              <input
                type="text"
                required
                value={form.headingPlain}
                onChange={(e) => setForm({ ...form, headingPlain: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="About"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heading (highlight)</label>
              <input
                type="text"
                required
                value={form.headingHighlight}
                onChange={(e) => setForm({ ...form, headingHighlight: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="UAMC"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paragraph 1</label>
            <textarea
              required
              rows={3}
              value={form.paragraph1}
              onChange={(e) => setForm({ ...form, paragraph1: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paragraph 2</label>
            <textarea
              required
              rows={3}
              value={form.paragraph2}
              onChange={(e) => setForm({ ...form, paragraph2: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Image 1 {about && "(leave empty to keep current)"}
              </label>
              {about?.image1 && (
                <div className="relative w-full h-28 mb-2 rounded overflow-hidden bg-gray-100">
                  <Image src={about.image1} alt="Current image 1" fill className="object-cover" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setImage1(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image 2 {about && "(leave empty to keep current)"}
              </label>
              {about?.image2 && (
                <div className="relative w-full h-28 mb-2 rounded overflow-hidden bg-gray-100">
                  <Image src={about.image2} alt="Current image 2" fill className="object-cover" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setImage2(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : about ? "Update About Section" : "Create About Section"}
          </button>
        </form>
      )}
    </main>
  );
}
