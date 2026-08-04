"use client";

import { useEffect, useState } from "react";

type NoticeItem = {
  _id: string;
  board: "notice" | "publication";
  category: string;
  day: string;
  month: string;
  title: string;
  time: string;
  order: number;
};

const NOTICE_TABS = ["General Notice", "Admission Notice", "Reports", "Job Circular"];
const PUBLICATION_TABS = ["Journal", "Tenders"];

const emptyForm = {
  board: "notice" as "notice" | "publication",
  category: NOTICE_TABS[0],
  day: "",
  month: "",
  title: "",
  time: "",
  order: 0,
};

export default function NoticeItemsAdminPage() {
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableTabs = form.board === "notice" ? NOTICE_TABS : PUBLICATION_TABS;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notice-items");
      const json = await res.json();
      if (json.success) setItems(json.data);
      else setErrorMsg(json.error || "Failed to load");
    } catch (err: any) {
      setErrorMsg(`Failed to load: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleBoardChange = (board: "notice" | "publication") => {
    const tabs = board === "notice" ? NOTICE_TABS : PUBLICATION_TABS;
    setForm({ ...form, board, category: tabs[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const url = editingId ? `/api/notice-items/${editingId}` : "/api/notice-items";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchItems();
      } else {
        setErrorMsg(json.error || "Failed to save");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setSaving(false);
  };

  const handleEdit = (item: NoticeItem) => {
    setEditingId(item._id);
    setForm({
      board: item.board,
      category: item.category,
      day: item.day,
      month: item.month,
      title: item.title,
      time: item.time,
      order: item.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/notice-items/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) fetchItems();
    else setErrorMsg(json.error || "Delete failed");
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Notice Board & Publication</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-10 space-y-4">
        <h2 className="font-medium text-lg">{editingId ? "Edit Item" : "Add New Item"}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Board</label>
            <select
              value={form.board}
              onChange={(e) => handleBoardChange(e.target.value as "notice" | "publication")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="notice">Notice Board</option>
              <option value="publication">Publication</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category (tab)</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {availableTabs.map((tab) => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Day</label>
            <input type="text" required value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="12" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input type="text" required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Mar 25" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input type="text" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="3.40 PM" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder='BCPS e-Logbook: Modernizing the Monitoring of FCPS 1st Phase Training' />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Items {loading && "(loading...)"}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-center w-14 shrink-0">
              <p className="text-lg font-semibold">{item.day}</p>
              <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">{item.month}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">{item.board === "notice" ? "Notice Board" : "Publication"} · {item.category}</p>
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(item)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="text-sm text-gray-400">No items yet — add one above.</p>}
      </div>
    </main>
  );
}
