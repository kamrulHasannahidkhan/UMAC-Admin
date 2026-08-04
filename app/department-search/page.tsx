"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PopularProgram = { title: string; image: string };

type DepartmentSearchContent = {
  _id: string;
  heading: string;
  description: string;
  searchPlaceholder: string;
  popularSearches: string[];
  popularProgram: PopularProgram | null;
  sideImage1: string;
  sideImage2: string;
  badgeNumber: string;
  badgeText: string;
};

const emptyForm = {
  heading: "",
  description: "",
  searchPlaceholder: "",
  popularSearches: "",
  badgeNumber: "",
  badgeText: "",
};

export default function DepartmentSearchAdminPage() {
  const [content, setContent] = useState<DepartmentSearchContent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sideImage1, setSideImage1] = useState<File | null>(null);
  const [sideImage2, setSideImage2] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [ppTitle, setPpTitle] = useState("");
  const [ppImage, setPpImage] = useState<File | null>(null);
  const [ppSaving, setPpSaving] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/department-search");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success && json.data) {
        setContent(json.data);
        setForm({
          heading: json.data.heading,
          description: json.data.description,
          searchPlaceholder: json.data.searchPlaceholder,
          popularSearches: json.data.popularSearches.join(", "),
          badgeNumber: json.data.badgeNumber,
          badgeText: json.data.badgeText,
        });
        if (json.data.popularProgram) setPpTitle(json.data.popularProgram.title);
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

    if (!content && (!sideImage1 || !sideImage2)) {
      alert("Please choose both side images for first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("heading", form.heading);
    formData.append("description", form.description);
    formData.append("searchPlaceholder", form.searchPlaceholder);
    formData.append(
      "popularSearches",
      JSON.stringify(form.popularSearches.split(",").map((s) => s.trim()).filter(Boolean))
    );
    formData.append("badgeNumber", form.badgeNumber);
    formData.append("badgeText", form.badgeText);
    if (sideImage1) formData.append("sideImage1", sideImage1);
    if (sideImage2) formData.append("sideImage2", sideImage2);

    const method = content ? "PUT" : "POST";

    try {
      const res = await fetch("/api/department-search", { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) {
        setSideImage1(null);
        setSideImage2(null);
        fetchContent();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setSaving(false);
  };

  const handlePopularProgramSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!content?.popularProgram && !ppImage) {
      alert("Please choose an image to create the Popular Program.");
      return;
    }

    setPpSaving(true);
    const formData = new FormData();
    formData.append("title", ppTitle);
    if (ppImage) formData.append("image", ppImage);

    try {
      const res = await fetch("/api/department-search/popular-program", { method: "PUT", body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) {
        setPpImage(null);
        fetchContent();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setPpSaving(false);
  };

  const handlePopularProgramDelete = async () => {
    if (!confirm("Delete the Popular Program?")) return;
    const res = await fetch("/api/department-search/popular-program", { method: "DELETE" });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (json?.success) {
      setPpTitle("");
      fetchContent();
    } else {
      setErrorMsg(json?.error || "Delete failed");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Department Search Section</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">Main Content</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Heading</label>
              <input
                type="text"
                required
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Find Your Department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Search box placeholder</label>
              <input
                type="text"
                required
                value={form.searchPlaceholder}
                onChange={(e) => setForm({ ...form, searchPlaceholder: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder='Find your program like "Department of Phycology"'
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Popular searches (comma-separated)</label>
              <input
                type="text"
                required
                value={form.popularSearches}
                onChange={(e) => setForm({ ...form, popularSearches: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Department of Microbiology, Department of Community Medicine, Department of Pathology"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Side image 1 {content && "(leave empty to keep current)"}
                </label>
                {content?.sideImage1 && (
                  <div className="relative w-full h-24 mb-2 rounded overflow-hidden bg-gray-100">
                    <Image src={content.sideImage1} alt="Current side image 1" fill className="object-cover" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setSideImage1(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Side image 2 {content && "(leave empty to keep current)"}
                </label>
                {content?.sideImage2 && (
                  <div className="relative w-full h-24 mb-2 rounded overflow-hidden bg-gray-100">
                    <Image src={content.sideImage2} alt="Current side image 2" fill className="object-cover" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setSideImage2(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Badge number</label>
                <input
                  type="text"
                  required
                  value={form.badgeNumber}
                  onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="28+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Badge text</label>
                <input
                  type="text"
                  required
                  value={form.badgeText}
                  onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Department Available For Student"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : content ? "Update Section" : "Create Section"}
            </button>
          </form>

          {content && (
            <form onSubmit={handlePopularProgramSave} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h2 className="font-medium text-lg">Popular Program (only one at a time)</h2>

              {content.popularProgram?.image && (
                <div className="relative w-32 h-20 rounded overflow-hidden bg-gray-100">
                  <Image src={content.popularProgram.image} alt="Popular program" fill className="object-cover" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={ppTitle}
                  onChange={(e) => setPpTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Department of Microbiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Image {content.popularProgram && "(leave empty to keep current)"}
                </label>
                <input type="file" accept="image/*" onChange={(e) => setPpImage(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={ppSaving}
                  className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {ppSaving ? "Saving..." : content.popularProgram ? "Update Popular Program" : "Create Popular Program"}
                </button>
                {content.popularProgram && (
                  <button
                    type="button"
                    onClick={handlePopularProgramDelete}
                    className="px-5 py-2 rounded text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </main>
  );
}
