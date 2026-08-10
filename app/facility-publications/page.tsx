"use client";

import { useEffect, useState } from "react";

type Publication = {
  _id: string;
  title: string;
  date: string;
  fileUrl: string;
  order: number;
};

const emptyForm = { title: "", date: "", order: 0 };

export default function FacilityPublicationsAdmin() {
  const [docs, setDocs] = useState<Publication[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const res = await fetch("/api/facility-publications");
      const json = await res.json();
      if (json.success) setDocs(json.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load publications: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingId && !file) {
      alert("Please choose a PDF file.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("date", form.date.trim());
    formData.append("order", String(form.order));
    if (file) formData.append("file", file);

    const url = editingId ? `/api/facility-publications/${editingId}` : "/api/facility-publications";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save publication.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  const editDoc = (d: Publication) => {
    setEditingId(d._id);
    setForm({ title: d.title, date: d.date, order: d.order });
    setFile(null);
  };

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete this publication?")) return;
    try {
      const res = await fetch(`/api/facility-publications/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) fetchAll();
      else setErrorMsg(json.error || "Failed to delete publication.");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Facility Publications Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-medium text-lg">{editingId ? "Edit Publication" : "Add Publication"}</h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="col-span-2 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">
              PDF File {editingId ? "(leave empty to keep current)" : <span className="text-red-500">*</span>}
            </label>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-40"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-xs text-gray-500 w-28 shrink-0">{d.date}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{d.title}</p>
              <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                View PDF
              </a>
            </div>
            <button onClick={() => editDoc(d)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">
              Edit
            </button>
            <button onClick={() => deleteDoc(d._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">
              Delete
            </button>
          </div>
        ))}
        {docs.length === 0 && <p className="text-sm text-gray-400">No publications yet — add one above.</p>}
      </div>
    </main>
  );
}
