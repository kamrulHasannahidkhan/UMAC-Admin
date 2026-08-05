"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Banner = { _id: string; headingPlain: string; headingHighlight: string; bgImage: string };

export default function AboutBannerAdminPage() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ headingPlain: "", headingHighlight: "" });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about-banner");
      const json = await res.json();
      if (json.success && json.data) {
        setBanner(json.data);
        setForm({ headingPlain: json.data.headingPlain, headingHighlight: json.data.headingHighlight });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!banner && !bgImage) {
      alert("Please choose a background image for first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("headingPlain", form.headingPlain);
    formData.append("headingHighlight", form.headingHighlight);
    if (bgImage) formData.append("bgImage", bgImage);

    const method = banner ? "PUT" : "POST";

    try {
      const res = await fetch("/api/about-banner", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setBgImage(null);
        fetchBanner();
      } else {
        setErrorMsg(json.error || "Failed to save");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">About Page Banner</h1>
      <p className="text-sm text-gray-500 mb-6">
        This banner is fixed at the top of every About page tab (Overview, History, Vision, etc.) — it doesn't change per tab except the breadcrumb, which updates automatically.
      </p>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heading (plain)</label>
              <input type="text" required value={form.headingPlain} onChange={(e) => setForm({ ...form, headingPlain: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="About" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heading (highlight)</label>
              <input type="text" required value={form.headingHighlight} onChange={(e) => setForm({ ...form, headingHighlight: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="UAMC" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Background image {banner && "(leave empty to keep current)"}
            </label>
            {banner?.bgImage && (
              <div className="relative w-full h-32 mb-2 rounded overflow-hidden bg-gray-100">
                <Image src={banner.bgImage} alt="Current background" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>
          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : banner ? "Update" : "Create"}
          </button>
        </form>
      )}
    </main>
  );
}
