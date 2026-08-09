"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type NoticeBannerContent = {
  _id: string;
  headingPlain: string;
  headingHighlight: string;
  bgImage: string;
  logoImage?: string;
};

export default function NoticeBannerAdmin() {
  const [banner, setBanner] = useState<NoticeBannerContent | null>(null);
  const [form, setForm] = useState({ headingPlain: "", headingHighlight: "" });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBanner = async () => {
    try {
      const res = await fetch("/api/notice-banner");
      const json = await res.json();
      if (json.success && json.data) {
        setBanner(json.data);
        setForm({ headingPlain: json.data.headingPlain, headingHighlight: json.data.headingHighlight });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load banner: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!banner && !bgImage) {
      alert("Please choose a background image for first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("headingPlain", form.headingPlain.trim());
    formData.append("headingHighlight", form.headingHighlight.trim());
    if (bgImage) formData.append("bgImage", bgImage);
    if (logoImage) formData.append("logoImage", logoImage);

    const method = banner ? "PUT" : "POST";

    try {
      const res = await fetch("/api/notice-banner", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setBgImage(null);
        setLogoImage(null);
        fetchBanner();
      } else {
        setErrorMsg(json.error || "Failed to save banner.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Notice & Media Banner Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Heading (plain)</label>
            <input
              type="text"
              required
              placeholder="e.g. Notice"
              value={form.headingPlain}
              onChange={(e) => setForm({ ...form, headingPlain: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heading (highlight)</label>
            <input
              type="text"
              required
              placeholder="e.g. UAMC"
              value={form.headingHighlight}
              onChange={(e) => setForm({ ...form, headingHighlight: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {banner?.bgImage && (
          <div className="relative w-full h-32 rounded overflow-hidden bg-gray-100">
            <Image src={banner.bgImage} alt="Background" fill className="object-cover" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            Background Image {banner ? "(leave empty to keep current)" : <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBgImage(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        {banner?.logoImage && (
          <div className="relative w-24 h-24 rounded overflow-hidden bg-gray-100">
            <Image src={banner.logoImage} alt="Logo" fill className="object-contain" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Logo Image (optional, defaults to site logo)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoImage(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : banner ? "Update" : "Create"}
        </button>
      </form>
    </main>
  );
}
