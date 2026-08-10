"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Department = {
  _id: string;
  name: string;
  image: string;
  establishedDate: string;
  learnMoreLink: string;
  order: number;
};

const emptyForm = { name: "", establishedDate: "", learnMoreLink: "", order: 0 };

export default function FacilityDepartmentsAdmin() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const res = await fetch("/api/facility-departments");
      const json = await res.json();
      if (json.success) setDepts(json.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load departments: ${err.message}`);
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

    setSaving(true);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("establishedDate", form.establishedDate.trim());
    formData.append("learnMoreLink", form.learnMoreLink.trim());
    formData.append("order", String(form.order));
    if (file) formData.append("image", file);

    const url = editingId ? `/api/facility-departments/${editingId}` : "/api/facility-departments";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save department.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  const editDept = (d: Department) => {
    setEditingId(d._id);
    setForm({ name: d.name, establishedDate: d.establishedDate, learnMoreLink: d.learnMoreLink, order: d.order });
    setFile(null);
  };

  const deleteDept = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try {
      const res = await fetch(`/api/facility-departments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) fetchAll();
      else setErrorMsg(json.error || "Failed to delete department.");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Facility Departments Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-medium text-lg">{editingId ? "Edit Department" : "Add Department"}</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="Department name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="Established date (e.g. February 19, 2025)"
            value={form.establishedDate}
            onChange={(e) => setForm({ ...form, establishedDate: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Learn More link (optional)"
            value={form.learnMoreLink}
            onChange={(e) => setForm({ ...form, learnMoreLink: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Order"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Image {editingId ? "(leave empty to keep current)" : <span className="text-red-500">*</span>}
          </label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
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

      <div className="grid grid-cols-4 gap-4">
        {depts.map((d) => (
          <div key={d._id} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="relative w-full h-24 rounded overflow-hidden mb-2 bg-gray-100">
              <Image src={d.image} alt={d.name} fill className="object-cover" />
            </div>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{d.name}</p>
            <p className="text-xs text-gray-500 mb-2">{d.establishedDate}</p>
            <div className="flex gap-2">
              <button onClick={() => editDept(d)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">
                Edit
              </button>
              <button onClick={() => deleteDept(d._id)} className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
        {depts.length === 0 && <p className="text-sm text-gray-400 col-span-4">No departments yet — add one above.</p>}
      </div>
    </main>
  );
}
