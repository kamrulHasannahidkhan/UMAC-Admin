"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Facility = {
  _id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  order: number;
};

const emptyForm = { name: "", title: "", description: "", order: 0 };

export default function FacilitiesAdminPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/facilities");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) setFacilities(json.data);
      else setErrorMsg(json?.error || `Failed to load (status ${res.status})`);
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingId && !file) {
      alert("Please choose an image for a new facility.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("order", String(form.order));
    if (file) formData.append("image", file);

    const url = editingId ? `/api/facilities/${editingId}` : "/api/facilities";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success) {
        resetForm();
        fetchFacilities();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setSaving(false);
  };

  const handleEdit = (f: Facility) => {
    setEditingId(f._id);
    setForm({ name: f.name, title: f.title, description: f.description, order: f.order });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this facility?")) return;
    const res = await fetch(`/api/facilities/${id}`, { method: "DELETE" });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (json?.success) fetchFacilities();
    else setErrorMsg(json?.error || "Delete failed");
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Facilities</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-10 space-y-4">
        <h2 className="font-medium text-lg">{editingId ? "Edit Facility" : "Add New Facility"}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">List name (left sidebar label)</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Laboratory"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Detail heading</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Laboratory Facilities"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Image {editingId && "(leave empty to keep current)"}
            </label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Facility" : "Add Facility"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Facilities {loading && "(loading...)"}</h2>
      <div className="space-y-4">
        {facilities.map((f) => (
          <div key={f._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative w-28 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
              <Image src={f.image} alt={f.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Order: {f.order}</p>
              <p className="font-medium truncate">{f.name}</p>
              <p className="text-sm text-gray-500 truncate">{f.title}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(f)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
              <button onClick={() => handleDelete(f._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {!loading && facilities.length === 0 && <p className="text-sm text-gray-400">No facilities yet — add one above.</p>}
      </div>
    </main>
  );
}
