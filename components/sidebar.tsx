"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GraduationCap, ArrowRight, HandHeart, Building2 } from "lucide-react";

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

const emptyForm = { badge: "", headingPlain: "", headingHighlight: "", paragraph1: "", paragraph2: "" };

function AboutPreview({
  badge,
  headingPlain,
  headingHighlight,
  paragraph1,
  paragraph2,
  image1PreviewUrl,
  image2PreviewUrl,
}: {
  badge: string;
  headingPlain: string;
  headingHighlight: string;
  paragraph1: string;
  paragraph2: string;
  image1PreviewUrl: string | null;
  image2PreviewUrl: string | null;
}) {
  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Live Preview — exact client layout</p>

      <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden p-4">
        <div className="grid grid-cols-1 gap-6 items-center">
          <div className="flex justify-center w-full">
            <div className="relative w-full max-w-[280px] h-[220px]">
              <div className="absolute left-0 bottom-0 w-[48%] h-[72%] overflow-hidden shadow-sm bg-gray-100">
                {image1PreviewUrl && (
                  <Image src={image1PreviewUrl} alt="preview 1" fill className="object-cover object-center" unoptimized />
                )}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-[48%] h-full overflow-hidden shadow-sm bg-gray-100">
                {image2PreviewUrl && (
                  <Image src={image2PreviewUrl} alt="preview 2" fill className="object-cover object-center" unoptimized />
                )}
              </div>
              <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 drop-shadow-xl">
                <Image src="/logo.png" alt="UAMC Seal" width={64} height={64} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[#00a651] font-semibold text-xs mb-2">
              <GraduationCap size={14} className="text-[#00a651]" />
              {badge || "Badge text"}
            </p>

            <h2 className="text-xl font-serif text-[#2b2b2b] mb-3 font-normal leading-tight break-words">
              {headingPlain || "Heading"}{" "}
              <span className="font-serif font-bold text-[#facc15]">{headingHighlight || "Highlight"}</span>
            </h2>

            <p className="text-gray-600 text-xs leading-relaxed mb-2 break-words [overflow-wrap:anywhere]">
              {paragraph1 || "Paragraph 1 text..."}
            </p>
            <p className="text-gray-600 text-xs leading-relaxed mb-4 break-words [overflow-wrap:anywhere]">
              {paragraph2 || "Paragraph 2 text..."}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="border border-dashed border-[#00a651]/60 p-2 flex items-center gap-2 bg-white">
                <HandHeart className="text-[#00a651] shrink-0" size={18} strokeWidth={1.5} />
                <p className="font-serif text-[9px] font-semibold text-[#00a651] leading-snug">
                  College Mission <br /> Statement
                </p>
              </div>
              <div className="border border-dashed border-[#00a651]/60 p-2 flex items-center gap-2 bg-white">
                <Building2 className="text-[#00a651] shrink-0" size={18} strokeWidth={1.5} />
                <p className="font-serif text-[9px] font-semibold text-[#00a651] leading-snug">
                  College Vision <br /> Achievement
                </p>
              </div>
            </div>

            <button
              type="button"
              className="bg-[#00a651] text-white font-semibold text-[9px] tracking-wider uppercase px-3 py-2 inline-flex items-center gap-1.5 pointer-events-none"
            >
              View Our Program <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">Mirrors the real About section — same fonts, colors, and layout as the live site.</p>
    </div>
  );
}

export default function AboutAdminPage() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1PreviewUrl, setImage1PreviewUrl] = useState<string | null>(null);
  const [image2PreviewUrl, setImage2PreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about");
      const json = await res.json();
      if (json?.success && json.data) {
        setAbout(json.data);
        setForm({
          badge: json.data.badge || "",
          headingPlain: json.data.headingPlain || "",
          headingHighlight: json.data.headingHighlight || "",
          paragraph1: json.data.paragraph1 || "",
          paragraph2: json.data.paragraph2 || "",
        });
        setImage1PreviewUrl(json.data.image1);
        setImage2PreviewUrl(json.data.image2);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load About section: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  useEffect(() => {
    if (!image1) return;
    const url = URL.createObjectURL(image1);
    setImage1PreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image1]);

  useEffect(() => {
    if (!image2) return;
    const url = URL.createObjectURL(image2);
    setImage2PreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image2]);

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
      const json = await res.json();

      if (json?.success) {
        setImage1(null);
        setImage2(null);
        await fetchAbout();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">About Section</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-lg">{about ? "Edit About Section" : "Add New Slide"}</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image 1 {about && "(leave empty to keep current)"}
                </label>
                <input type="file" accept="image/*" onChange={(e) => setImage1(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image 2 {about && "(leave empty to keep current)"}
                </label>
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

          <AboutPreview
            badge={form.badge}
            headingPlain={form.headingPlain}
            headingHighlight={form.headingHighlight}
            paragraph1={form.paragraph1}
            paragraph2={form.paragraph2}
            image1PreviewUrl={image1PreviewUrl}
            image2PreviewUrl={image2PreviewUrl}
          />
        </div>
      )}
    </main>
  );
}