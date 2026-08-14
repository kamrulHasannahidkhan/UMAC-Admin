"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Banner = { _id: string; headingPlain: string; headingHighlight: string; bgImage: string };
const TABS = ["Career Banner", "Events Banner"];
const ENDPOINT_MAP: Record<string, string> = { "Career Banner": "career-banner", "Events Banner": "events-banner" };

export default function PageBannersAdmin() {
  const [tab, setTab] = useState("Career Banner");
  const [banner, setBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ headingPlain: "", headingHighlight: "" });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBanner = async () => {
    setLoading(true);
    const res = await fetch(`/api/${ENDPOINT_MAP[tab]}`);
    const json = await res.json();
    if (json.success && json.data) {
      setBanner(json.data);
      setForm({ headingPlain: json.data.headingPlain, headingHighlight: json.data.headingHighlight });
    } else {
      setBanner(null);
      setForm({ headingPlain: "", headingHighlight: "" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanner();
  }, [tab]);

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
      const res = await fetch(`/api/${ENDPOINT_MAP[tab]}`, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setBgImage(null);
        fetchBanner();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Page Banners</h1>

      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium ${tab === t ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Heading (plain)" value={form.headingPlain} onChange={(e) => setForm({ ...form, headingPlain: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
            <input type="text" required placeholder="Heading (highlight)" value={form.headingHighlight} onChange={(e) => setForm({ ...form, headingHighlight: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          {banner?.bgImage && (
            <div className="relative w-full h-32 rounded overflow-hidden bg-gray-100">
              <Image src={banner.bgImage} alt="Current" fill className="object-cover" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : banner ? "Update" : "Create"}
          </button>
        </form>
      )}
    </main>
  );
}
