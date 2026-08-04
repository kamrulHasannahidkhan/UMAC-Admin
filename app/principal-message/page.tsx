"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PrincipalContent = {
  _id: string;
  badge: string;
  headingPlain: string;
  headingHighlight: string;
  signatureImage: string;
  honorificLabel: string;
  name: string;
  positionTitle: string;
  positionSuffix: string;
  subtitle: string;
  description: string;
  buttonText: string;
  photo: string;
};

const emptyForm = {
  badge: "",
  headingPlain: "",
  headingHighlight: "",
  honorificLabel: "",
  name: "",
  positionTitle: "",
  positionSuffix: "",
  subtitle: "",
  description: "",
  buttonText: "",
};

export default function PrincipalMessageAdminPage() {
  const [content, setContent] = useState<PrincipalContent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/principal-message");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success && json.data) {
        setContent(json.data);
        setForm({
          badge: json.data.badge,
          headingPlain: json.data.headingPlain,
          headingHighlight: json.data.headingHighlight,
          honorificLabel: json.data.honorificLabel,
          name: json.data.name,
          positionTitle: json.data.positionTitle,
          positionSuffix: json.data.positionSuffix,
          subtitle: json.data.subtitle,
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

    if (!content && (!signatureImage || !photo)) {
      alert("Please choose both the signature image and the photo for first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (signatureImage) formData.append("signatureImage", signatureImage);
    if (photo) formData.append("photo", photo);

    const method = content ? "PUT" : "POST";

    try {
      const res = await fetch("/api/principal-message", { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) {
        setSignatureImage(null);
        setPhoto(null);
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
      <h1 className="text-2xl font-semibold mb-6">Principal Message</h1>

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
            <input type="text" required value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="knowledge meets innovation" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heading (plain)</label>
              <input type="text" required value={form.headingPlain} onChange={(e) => setForm({ ...form, headingPlain: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Message from the" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heading (highlight)</label>
              <input type="text" required value={form.headingHighlight} onChange={(e) => setForm({ ...form, headingHighlight: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Principal" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Signature image {content && "(leave empty to keep current)"}
            </label>
            {content?.signatureImage && (
              <div className="relative w-32 h-16 mb-2 bg-gray-50 rounded">
                <Image src={content.signatureImage} alt="Current signature" fill className="object-contain" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setSignatureImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Honorific label</label>
              <input type="text" required value={form.honorificLabel} onChange={(e) => setForm({ ...form, honorificLabel: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Honorable" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Prof. Dr. Mohammad Mohibur Rahman" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Position title</label>
              <input type="text" required value={form.positionTitle} onChange={(e) => setForm({ ...form, positionTitle: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Principal" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position suffix</label>
              <input type="text" value={form.positionSuffix} onChange={(e) => setForm({ ...form, positionSuffix: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="(In Charge)" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" required value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Ensuring Quality Healthcare & Medical Education" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Button text</label>
            <input type="text" required value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Read More" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Photo {content && "(leave empty to keep current)"}
            </label>
            {content?.photo && (
              <div className="relative w-full h-40 mb-2 rounded overflow-hidden bg-gray-100">
                <Image src={content.photo} alt="Current photo" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>

          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : content ? "Update" : "Create"}
          </button>
        </form>
      )}
    </main>
  );
}
