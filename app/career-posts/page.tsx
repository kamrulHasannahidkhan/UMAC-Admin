"use client";

import { useEffect, useState } from "react";

type Post = { _id: string; title: string; department: string; type: string; deadline: string; description: string; applyLink: string; order: number };
const emptyForm = { title: "", department: "", type: "Full-time", deadline: "", description: "", applyLink: "", order: 0 };

export default function CareerPostsAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch("/api/career-posts");
    const json = await res.json();
    if (json.success) setPosts(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const url = editingId ? `/api/career-posts/${editingId}` : "/api/career-posts";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchPosts();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEdit = (p: Post) => {
    setEditingId(p._id);
    setForm({ title: p.title, department: p.department, type: p.type, deadline: p.deadline, description: p.description, applyLink: p.applyLink, order: p.order });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    await fetch(`/api/career-posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Career Postings</h1>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
        <h2 className="font-medium text-lg">{editingId ? "Edit Posting" : "Add New Posting"}</h2>

        <input type="text" required placeholder="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />

        <div className="grid grid-cols-3 gap-4">
          <input type="text" required placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <input type="text" required placeholder="Deadline (e.g. Sep 30, 2026)" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <textarea required rows={4} placeholder="Job Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />

        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Apply link (optional, e.g. mailto: or URL)" value={form.applyLink} onChange={(e) => setForm({ ...form, applyLink: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Postings {loading && "(loading...)"}</h2>
      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-400">{p.department} · {p.type} · Deadline: {p.deadline}</p>
              <p className="font-medium">{p.title}</p>
            </div>
            <button onClick={() => handleEdit(p)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
            <button onClick={() => handleDelete(p._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
          </div>
        ))}
        {!loading && posts.length === 0 && <p className="text-sm text-gray-400">No postings yet — add one above.</p>}
      </div>
    </main>
  );
}
