"use client";

import { useEffect, useState } from "react";

type Info = { _id: string; phone: string; email: string; location: string; hoursWeekday: string; hoursWeekend: string };

export default function ContactInfoAdminPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [form, setForm] = useState({ phone: "", email: "", location: "", hoursWeekday: "", hoursWeekend: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact-info");
      const json = await res.json();
      if (json.success && json.data) {
        setInfo(json.data);
        setForm({
          phone: json.data.phone,
          email: json.data.email,
          location: json.data.location,
          hoursWeekday: json.data.hoursWeekday,
          hoursWeekend: json.data.hoursWeekend,
        });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    const method = info ? "PUT" : "POST";
    try {
      const res = await fetch("/api/contact-info", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) fetchInfo();
      else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Contact Information</h1>
      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Phone No." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <input type="text" required placeholder="Location / Address" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Weekday hours (e.g. Monday - Friday: 8:00 am - 5:00 pm)" value={form.hoursWeekday} onChange={(e) => setForm({ ...form, hoursWeekday: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
            <input type="text" required placeholder="Weekend hours" value={form.hoursWeekend} onChange={(e) => setForm({ ...form, hoursWeekend: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : info ? "Update" : "Create"}
          </button>
        </form>
      )}
    </main>
  );
}
