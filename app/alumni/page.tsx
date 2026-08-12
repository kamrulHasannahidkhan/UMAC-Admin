"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type AlumniEntry = { _id: string; name: string; title: string; designation: string; email: string; image: string; order: number };
const emptyForm = { name: "", title: "", designation: "", email: "", order: 0 };

export default function AlumniAdminPage() {
  const [list, setList] = useState<AlumniEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch("/api/alumni");
    const json = await res.json();
    if (json.success) setList(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
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
      alert("Please choose a photo for a new entry.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("title", form.title);
    formData.append("designation", form.designation);
    formData.append("order", String(form.order));
    if (!editingId) formData.append("email", form.email);
    if (file) formData.append("image", file);

    const url = editingId ? `/api/alumni/${editingId}` : "/api/alumni";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchList();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEdit = (a: AlumniEntry) => {
    setEditingId(a._id);
    setForm({ name: a.name, title: a.title, designation: a.designation, email: a.email, order: a.order });
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this alumni entry?")) return;
    await fetch(`/api/alumni/${id}`, { method: "DELETE" });
    fetchList();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">Alumni</h1>
      <p className="text-sm text-gray-500 mb-6">
        Create an entry for each alumnus here. They can then claim it at the Alumni portal using this exact email, set their own password, and edit their own photo/title/designation afterward.
      </p>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
        <h2 className="font-medium text-lg">{editingId ? "Edit Entry" : "Add New Alumni"}</h2>

        <div className="grid grid-cols-2 gap-4">
          <input type="text" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" required placeholder="Title (e.g. Class of 2015)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Designation (e.g. Consultant Physician)" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        {!editingId && (
          <input type="email" required placeholder="Email (they'll use this to claim their profile)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        )}
        {editingId && <p className="text-xs text-gray-400">Email can't be changed once created — {list.find((a) => a._id === editingId)?.email}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">
            Photo {editingId && "(leave empty to keep current)"}
          </label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Alumni {loading && "(loading...)"}</h2>
      <div className="grid grid-cols-3 gap-4">
        {list.map((a) => (
          <div key={a._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative w-full h-32 rounded overflow-hidden mb-2 bg-gray-100">
              <Image src={a.image} alt={a.name} fill className="object-cover" />
            </div>
            <p className="font-medium text-sm">{a.name}</p>
            <p className="text-xs text-gray-500">{a.title}</p>
            {a.designation && <p className="text-xs text-gray-400">{a.designation}</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleEdit(a)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">Edit</button>
              <button onClick={() => handleDelete(a._id)} className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {!loading && list.length === 0 && <p className="text-sm text-gray-400 col-span-3">No alumni yet — add one above.</p>}
      </div>
    </main>
  );
}
