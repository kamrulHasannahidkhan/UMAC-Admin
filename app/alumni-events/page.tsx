"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type AlumniEvent = { _id: string; title: string; date: string; time: string; location: string; order: number };
type Content = { _id: string; heading: string; viewAllLink: string; image: string };

const emptyContentForm = { heading: "", viewAllLink: "" };
const emptyEventForm = { title: "", date: "", time: "", location: "", order: 0 };

export default function AlumniEventsAdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [contentImage, setContentImage] = useState<File | null>(null);
  const [contentSaving, setContentSaving] = useState(false);

  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventSaving, setEventSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contentRes, eventsRes] = await Promise.all([
        fetch("/api/alumni-events").then((r) => r.json()),
        fetch("/api/alumni-events-list").then((r) => r.json()),
      ]);
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
        setContentForm({ heading: contentRes.data.heading, viewAllLink: contentRes.data.viewAllLink });
      }
      if (eventsRes.success) setEvents(eventsRes.data);
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

    if (!content && !contentImage) {
      alert("Please choose an image for first-time setup.");
      return;
    }

    setContentSaving(true);
    const formData = new FormData();
    formData.append("heading", contentForm.heading);
    formData.append("viewAllLink", contentForm.viewAllLink);
    if (contentImage) formData.append("image", contentImage);

    const method = content ? "PUT" : "POST";

    try {
      const res = await fetch("/api/alumni-events", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setContentImage(null);
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setContentSaving(false);
  };

  const resetEventForm = () => {
    setEventForm(emptyEventForm);
    setEditingEventId(null);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEventSaving(true);

    const url = editingEventId ? `/api/alumni-events-list/${editingEventId}` : "/api/alumni-events-list";
    const method = editingEventId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });
      const json = await res.json();
      if (json.success) {
        resetEventForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save event");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setEventSaving(false);
  };

  const handleEventEdit = (event: AlumniEvent) => {
    setEditingEventId(event._id);
    setEventForm({ title: event.title, date: event.date, time: event.time, location: event.location, order: event.order });
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleEventDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/alumni-events-list/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) fetchAll();
    else setErrorMsg(json.error || "Delete failed");
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Alumni Events</h1>

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
            <h2 className="font-medium text-lg">Heading, Link & Side Image</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heading</label>
                <input type="text" required value={contentForm.heading} onChange={(e) => setContentForm({ ...contentForm, heading: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Alumni Event" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">"View All" link</label>
                <input type="text" required value={contentForm.viewAllLink} onChange={(e) => setContentForm({ ...contentForm, viewAllLink: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="/alumni/events" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Side image {content && "(leave empty to keep current)"}
              </label>
              {content?.image && (
                <div className="relative w-full h-32 mb-2 rounded overflow-hidden bg-gray-100">
                  <Image src={content.image} alt="Current image" fill className="object-cover" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setContentImage(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <button type="submit" disabled={contentSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {contentSaving ? "Saving..." : content ? "Update" : "Create"}
            </button>
          </form>

          <form onSubmit={handleEventSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">{editingEventId ? "Edit Event" : "Add New Event"}</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Bridging Cultures: Global Perspectives in" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="text" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="August 20, 2024" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="text" required value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="4:27 am" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input type="number" value={eventForm.order} onChange={(e) => setEventForm({ ...eventForm, order: Number(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" required value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Yarra Park, UK" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={eventSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {eventSaving ? "Saving..." : editingEventId ? "Update Event" : "Add Event"}
              </button>
              {editingEventId && (
                <button type="button" onClick={resetEventForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2 className="font-medium text-lg mb-4">All Events</h2>
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={event._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
                <span className="text-2xl font-serif text-gray-300 w-10">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.date} · {event.time} · {event.location}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEventEdit(event)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleEventDelete(event._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-gray-400">No events yet — add one above.</p>}
          </div>
        </>
      )}
    </main>
  );
}
