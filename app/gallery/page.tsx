"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type GalleryImageItem = {
  _id: string;
  image: string;
  imagePublicId: string;
  caption: string;
  order: number;
};

const emptyForm = { caption: "", order: 0 };

export default function GalleryAdmin() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const res = await fetch("/api/gallery");
      const json = await res.json();
      if (json.success) setImages(json.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load gallery: ${err.message}`);
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
      alert("Please choose an image.");
      return;
    }
    if (!form.caption.trim()) {
      setErrorMsg("Caption is required.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("caption", form.caption.trim());
    formData.append("order", String(form.order));
    if (file) formData.append("image", file);

    const url = editingId ? `/api/gallery/${editingId}` : "/api/gallery";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save image.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  const editImage = (img: GalleryImageItem) => {
    setEditingId(img._id);
    setForm({ caption: img.caption, order: img.order });
    setFile(null);
  };

  const deleteImage = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to delete image.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Event Gallery Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-medium text-lg">{editingId ? "Edit Image" : "Add Image"}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Caption <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alumni Reunion Ceremony"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
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

        <div>
          <label className="block text-sm font-medium mb-1">
            Image {editingId ? "(leave empty to keep current)" : <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative w-full h-32 rounded overflow-hidden mb-2 bg-gray-100">
              <Image src={img.image} alt={img.caption} fill className="object-cover" />
            </div>
            <p className="text-sm text-gray-900 mb-2 line-clamp-2">{img.caption}</p>
            <div className="flex gap-2">
              <button
                onClick={() => editImage(img)}
                className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => deleteImage(img._id)}
                className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p className="text-sm text-gray-400 col-span-3">No images yet — add one above.</p>}
      </div>
    </main>
  );
}
