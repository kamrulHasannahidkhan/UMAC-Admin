"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Event = { _id: string; title: string; date: string; time: string; location: string; description: string; image: string; order: number };
const emptyForm = { title: "", date: "", time: "", location: "", description: "", order: 0 };

export default function EventPostsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch("/api/event-posts");
    const json = await res.json();
    if (json.success) setEvents(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
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
      alert("Please choose an image for a new event.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("date", form.date);
    formData.append("time", form.time);
    formData.append("location", form.location);
    formData.append("description", form.description);
    formData.append("order", String(form.order));
    if (file) formData.append("image", file);

    const url = editingId ? `/api/event-posts/${editingId}` : "/api/event-posts";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchEvents();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEdit = (ev: Event) => {
    setEditingId(ev._id);
    setForm({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description, order: ev.order });
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/event-posts/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Events</h1>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
        <h2 className="font-medium text-lg">{editingId ? "Edit Event" : "Add New Event"}</h2>

        <input type="text" required placeholder="Event Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />

        <div className="grid grid-cols-3 gap-4">
          <input type="text" required placeholder="Date (e.g. Sep 20, 2026)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" required placeholder="Time (e.g. 10:00 AM)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" required placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <textarea required rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />

        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Events {loading && "(loading...)"}</h2>
      <div className="space-y-2">
        {events.map((ev) => (
          <div key={ev._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative w-20 h-14 shrink-0 rounded overflow-hidden bg-gray-100">
              <Image src={ev.image} alt={ev.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{ev.date} · {ev.time} · {ev.location}</p>
              <p className="font-medium">{ev.title}</p>
            </div>
            <button onClick={() => handleEdit(ev)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
            <button onClick={() => handleDelete(ev._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
          </div>
        ))}
        {!loading && events.length === 0 && <p className="text-sm text-gray-400">No events yet — add one above.</p>}
      </div>
    </main>
  );
}
