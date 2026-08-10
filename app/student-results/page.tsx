"use client";

import { useEffect, useState } from "react";

type Result = { _id: string; studentEmail: string; semester: string; subject: string; marks: string; grade: string; remarks: string; order: number };
const emptyForm = { studentEmail: "", semester: "", subject: "", marks: "", grade: "", remarks: "", order: 0 };

export default function StudentResultsAdminPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    const res = await fetch("/api/student-results");
    const json = await res.json();
    if (json.success) setResults(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const url = editingId ? `/api/student-results/${editingId}` : "/api/student-results";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        resetForm();
        fetchResults();
      } else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEdit = (r: Result) => {
    setEditingId(r._id);
    setForm({ studentEmail: r.studentEmail, semester: r.semester, subject: r.subject, marks: r.marks, grade: r.grade, remarks: r.remarks, order: r.order });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this result entry?")) return;
    await fetch(`/api/student-results/${id}`, { method: "DELETE" });
    fetchResults();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">Student Results</h1>
      <p className="text-sm text-gray-500 mb-6">Each result is tied to a student's email — they'll see only their own results after logging in.</p>

      {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
        <h2 className="font-medium text-lg">{editingId ? "Edit Result" : "Add New Result"}</h2>
        <input type="email" required placeholder="Student email (must match their account, e.g. name@umac.edu.bd)" value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" required placeholder="Semester (e.g. 3rd Semester)" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" required placeholder="Marks" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" required placeholder="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <input type="text" placeholder="Remarks (optional)" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      <h2 className="font-medium text-lg mb-4">All Results {loading && "(loading...)"}</h2>
      <div className="space-y-2">
        {results.map((r) => (
          <div key={r._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-400">{r.studentEmail} · {r.semester}</p>
              <p className="font-medium">{r.subject} — {r.marks} ({r.grade})</p>
              {r.remarks && <p className="text-xs text-gray-500">{r.remarks}</p>}
            </div>
            <button onClick={() => handleEdit(r)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
            <button onClick={() => handleDelete(r._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
          </div>
        ))}
        {!loading && results.length === 0 && <p className="text-sm text-gray-400">No results yet — add one above.</p>}
      </div>
    </main>
  );
}
