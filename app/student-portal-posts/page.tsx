"use client";

import { useEffect, useState } from "react";

type Post = { _id: string; type: "news" | "publication" | "notice"; title: string; description: string; date: string; order: number };
const emptyForm: { type: "news" | "publication" | "notice"; title: string; description: string; date: string; order: number } = { type: "news", title: "", description: "", date: "", order: 0 };

export default function StudentPortalPostsAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch("/api/student-portal-posts");
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
    const url = editingId ? `/api/student-portal-posts/${editingId}` : "/api/student-portal-posts";
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
    setForm({ type: p.type, title: p.title, description: p.description, date: p.date, order: p.order });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/student-portal-posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Student Portal — News / Publication / Notice</h1>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
        <h2 className="font-medium text-lg">{editingId ? "Edit Post" : "Add New Post"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Post["type"] })} className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="news">College News</option>
            <option value="publication">Publication</option>
            <option value="notice">Notice</option>
          </select>
          <input type="text" required placeholder="Date (e.g. Mar 12, 2025)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <input type="text" required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        <textarea required rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-32 border border-gray-300 rounded px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Posts {loading && "(loading...)"}</h2>
      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-xs uppercase font-semibold text-green-600 w-24 shrink-0">{p.type}</span>
            <div className="flex-1">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-gray-500">{p.date}</p>
            </div>
            <button onClick={() => handleEdit(p)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
            <button onClick={() => handleDelete(p._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
          </div>
        ))}
        {!loading && posts.length === 0 && <p className="text-sm text-gray-400">No posts yet — add one above.</p>}
      </div>
    </main>
  );
}
