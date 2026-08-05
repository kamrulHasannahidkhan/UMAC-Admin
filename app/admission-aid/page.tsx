"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Link = { _id: string; title: string; order: number };
type Content = { _id: string; heading: string; image: string };

export default function AdmissionAidAdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [heading, setHeading] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [contentSaving, setContentSaving] = useState(false);

  const [links, setLinks] = useState<Link[]>([]);
  const [linkForm, setLinkForm] = useState({ title: "", order: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkSaving, setLinkSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([
        fetch("/api/admission-aid").then((r) => r.json()),
        fetch("/api/admission-aid-links").then((r) => r.json()),
      ]);
      if (c.success && c.data) {
        setContent(c.data);
        setHeading(c.data.heading);
      }
      if (l.success) setLinks(l.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const submitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!content && !image) {
      alert("Please choose an image for first-time setup.");
      return;
    }
    setContentSaving(true);
    const formData = new FormData();
    formData.append("heading", heading);
    if (image) formData.append("image", image);
    const method = content ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admission-aid", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setImage(null);
        fetchAll();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setContentSaving(false);
  };

  const resetLinkForm = () => {
    setLinkForm({ title: "", order: 0 });
    setEditingId(null);
  };

  const submitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLinkSaving(true);
    const url = editingId ? `/api/admission-aid-links/${editingId}` : "/api/admission-aid-links";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(linkForm) });
      const json = await res.json();
      if (json.success) {
        resetLinkForm();
        fetchAll();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setLinkSaving(false);
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/admission-aid-links/${id}`, { method: "DELETE" });
    fetchAll();
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Admission &amp; Aid (About Overview)</h1>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <form onSubmit={submitContent} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
            <h2 className="font-medium text-lg">Heading & Image</h2>
            <input type="text" required placeholder="Admission & Aid" value={heading} onChange={(e) => setHeading(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            {content?.image && (
              <div className="relative w-full h-32 rounded overflow-hidden bg-gray-100">
                <Image src={content.image} alt="Current" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
            <button type="submit" disabled={contentSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {contentSaving ? "Saving..." : content ? "Update" : "Create"}
            </button>
          </form>

          <form onSubmit={submitLink} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
            <h2 className="font-medium text-lg">{editingId ? "Edit Link" : "Add New Link"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required placeholder="Popular Fee Chart" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Order" value={linkForm.order} onChange={(e) => setLinkForm({ ...linkForm, order: Number(e.target.value) })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={linkSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {linkSaving ? "Saving..." : editingId ? "Update Link" : "Add Link"}
              </button>
              {editingId && <button type="button" onClick={resetLinkForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>}
            </div>
          </form>

          <div className="space-y-2">
            {links.map((l) => (
              <div key={l._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
                <p className="flex-1 font-medium">{l.title}</p>
                <button onClick={() => { setEditingId(l._id); setLinkForm({ title: l.title, order: l.order }); }} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
                <button onClick={() => deleteLink(l._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
