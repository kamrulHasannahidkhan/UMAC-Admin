"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type NewsPost = { _id: string; category: string; title: string; excerpt: string; author: string; date: string; image: string; order: number };
type Content = { _id: string; heading: string; subheading: string; viewAllLink: string };

const emptyContentForm = { heading: "", subheading: "", viewAllLink: "" };
const emptyPostForm = { category: "", title: "", excerpt: "", author: "", date: "", order: 0 };

export default function NewsAdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [contentSaving, setContentSaving] = useState(false);

  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [postForm, setPostForm] = useState(emptyPostForm);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postSaving, setPostSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contentRes, postsRes] = await Promise.all([
        fetch("/api/news").then((r) => r.json()),
        fetch("/api/news-posts").then((r) => r.json()),
      ]);
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
        setContentForm({
          heading: contentRes.data.heading,
          subheading: contentRes.data.subheading,
          viewAllLink: contentRes.data.viewAllLink,
        });
      }
      if (postsRes.success) setPosts(postsRes.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setContentSaving(true);
    const method = content ? "PUT" : "POST";
    try {
      const res = await fetch("/api/news", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm),
      });
      const json = await res.json();
      if (json.success) fetchAll();
      else setErrorMsg(json.error || "Failed to save");
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setContentSaving(false);
  };

  const resetPostForm = () => {
    setPostForm(emptyPostForm);
    setPostFile(null);
    setEditingPostId(null);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingPostId && !postFile) {
      alert("Please choose an image for a new post.");
      return;
    }

    setPostSaving(true);
    const formData = new FormData();
    Object.entries(postForm).forEach(([key, value]) => formData.append(key, String(value)));
    if (postFile) formData.append("image", postFile);

    const url = editingPostId ? `/api/news-posts/${editingPostId}` : "/api/news-posts";
    const method = editingPostId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetPostForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save post");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setPostSaving(false);
  };

  const handlePostEdit = (post: NewsPost) => {
    setEditingPostId(post._id);
    setPostForm({
      category: post.category,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: post.date,
      order: post.order,
    });
    setPostFile(null);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handlePostDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/news-posts/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) fetchAll();
    else setErrorMsg(json.error || "Delete failed");
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">News / Latest Posts</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <form onSubmit={handleContentSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">Heading & Subheading</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Heading</label>
              <input type="text" required value={contentForm.heading} onChange={(e) => setContentForm({ ...contentForm, heading: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Read Our Latest News" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subheading</label>
              <input type="text" required value={contentForm.subheading} onChange={(e) => setContentForm({ ...contentForm, subheading: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="You'll find something to spark your curiosity and enhance" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">"View All" link</label>
              <input type="text" required value={contentForm.viewAllLink} onChange={(e) => setContentForm({ ...contentForm, viewAllLink: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="/news" />
            </div>
            <button type="submit" disabled={contentSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {contentSaving ? "Saving..." : content ? "Update" : "Create"}
            </button>
          </form>

          <form onSubmit={handlePostSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">{editingPostId ? "Edit Post" : "Add New Post"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input type="text" required value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Education" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="text" required value={postForm.date} onChange={(e) => setPostForm({ ...postForm, date: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="August 6, 2024" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Those inequalities areinequalities" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea required rows={2} value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input type="text" required value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="admin" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input type="number" value={postForm.order} onChange={(e) => setPostForm({ ...postForm, order: Number(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image {editingPostId && "(leave empty to keep current)"}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setPostFile(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={postSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {postSaving ? "Saving..." : editingPostId ? "Update Post" : "Add Post"}
              </button>
              {editingPostId && (
                <button type="button" onClick={resetPostForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2 className="font-medium text-lg mb-4">All Posts</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-yellow-600 font-medium mb-1">{post.category}</p>
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.author} · {post.date}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handlePostEdit(post)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handlePostDelete(post._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-sm text-gray-400">No posts yet — add one above.</p>}
          </div>
        </>
      )}
    </main>
  );
}
