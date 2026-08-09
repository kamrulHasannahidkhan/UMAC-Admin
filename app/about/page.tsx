"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type HistoryItem = { _id: string; year: string; title: string; description: string; order: number };
type Vision = { _id: string; heading: string; description: string; image: string };
type Objective = { title: string; description: string };
type Aim = { _id: string; aim: string; objectives: Objective[] };
type Person = { _id: string; group: string; name: string; title: string; photo: string; order: number };
type OrgStructure = { _id: string; image: string };

const SUB_TABS = ["History", "Vision", "Aim & Objective", "Org Structure", "Founder Member", "EC Members", "GB Members"];
const GROUP_MAP: Record<string, string> = {
  "Founder Member": "founder-member",
  "EC Members": "ec-member",
  "GB Members": "gb-member",
};

const emptyPersonForm = { name: "", title: "", order: 0 };

export default function AboutPageAdmin() {
  const [subTab, setSubTab] = useState("History");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyForm, setHistoryForm] = useState({ year: "", title: "", description: "", order: 0 });
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);

  // Vision State
  const [vision, setVision] = useState<Vision | null>(null);
  const [visionForm, setVisionForm] = useState({ heading: "", description: "" });
  const [visionImage, setVisionImage] = useState<File | null>(null);

  // Aim State
  const [aim, setAim] = useState<Aim | null>(null);
  const [aimText, setAimText] = useState("");
  const [objectives, setObjectives] = useState<Objective[]>([{ title: "", description: "" }]);

  // Org Structure State
  const [orgStructure, setOrgStructure] = useState<OrgStructure | null>(null);
  const [orgImage, setOrgImage] = useState<File | null>(null);
  const [orgSaving, setOrgSaving] = useState(false);

  // People State
  const [people, setPeople] = useState<Person[]>([]);
  const [personForm, setPersonForm] = useState(emptyPersonForm);
  const [personPhoto, setPersonPhoto] = useState<File | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [personSaving, setPersonSaving] = useState(false);

  // Fetch all administrative data
  const fetchAll = async () => {
    try {
      const [h, v, a, p, o] = await Promise.all([
        fetch("/api/about-history").then((r) => r.json()),
        fetch("/api/about-vision").then((r) => r.json()),
        fetch("/api/about-aim").then((r) => r.json()),
        fetch("/api/about-people").then((r) => r.json()),
        fetch("/api/about-org-structure").then((r) => r.json()),
      ]);
      if (h.success) setHistory(h.data);
      if (v.success && v.data) {
        setVision(v.data);
        setVisionForm({ heading: v.data.heading, description: v.data.description });
      }
      if (a.success && a.data) {
        setAim(a.data);
        setAimText(a.data.aim);
        setObjectives(a.data.objectives.length ? a.data.objectives : [{ title: "", description: "" }]);
      }
      if (p.success) setPeople(p.data);
      if (o.success && o.data) setOrgStructure(o.data);
    } catch (err: any) {
      setErrorMsg(`Failed to load data: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- History Handlers ---
  const submitHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const url = editingHistoryId ? `/api/about-history/${editingHistoryId}` : "/api/about-history";
    const method = editingHistoryId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historyForm),
      });
      const json = await res.json();
      if (json.success) {
        setHistoryForm({ year: "", title: "", description: "", order: 0 });
        setEditingHistoryId(null);
        fetchAll();
      } else {
        setErrorMsg(json.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const deleteHistory = async (id: string) => {
    if (!confirm("Delete this history entry?")) return;
    await fetch(`/api/about-history/${id}`, { method: "DELETE" });
    fetchAll();
  };

  // --- Vision Handlers ---
  const submitVision = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!vision && !visionImage) {
      alert("Please choose an image for first-time setup.");
      return;
    }
    const formData = new FormData();
    formData.append("heading", visionForm.heading);
    formData.append("description", visionForm.description);
    if (visionImage) formData.append("image", visionImage);
    const method = vision ? "PUT" : "POST";
    try {
      const res = await fetch("/api/about-vision", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setVisionImage(null);
        fetchAll();
      } else {
        setErrorMsg(json.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // --- Aim & Objectives Handlers ---
  const submitAim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const method = aim ? "PUT" : "POST";
    try {
      const res = await fetch("/api/about-aim", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aim: aimText, objectives }),
      });
      const json = await res.json();
      if (json.success) fetchAll();
      else setErrorMsg(json.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const updateObjective = (i: number, field: keyof Objective, value: string) => {
    const next = [...objectives];
    next[i] = { ...next[i], [field]: value };
    setObjectives(next);
  };

  // --- Org Structure Handlers ---
  const submitOrgStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!orgStructure && !orgImage) {
      alert("Please choose an image.");
      return;
    }
    setOrgSaving(true);
    const formData = new FormData();
    if (orgImage) formData.append("image", orgImage);
    const method = orgStructure ? "PUT" : "POST";
    try {
      const res = await fetch("/api/about-org-structure", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setOrgImage(null);
        fetchAll();
      } else {
        setErrorMsg(json.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setOrgSaving(false);
  };

  // --- People Handlers ---
  const currentGroup = GROUP_MAP[subTab];

  const resetPersonForm = () => {
    setPersonForm(emptyPersonForm);
    setPersonPhoto(null);
    setEditingPersonId(null);
  };

  const submitPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = personForm.name.trim();
    if (!trimmedName) {
      setErrorMsg("Full Name is required.");
      return;
    }

    if (!editingPersonId && !personPhoto) {
      alert("Please choose a photo.");
      return;
    }

    setPersonSaving(true);
    const formData = new FormData();
    formData.append("group", currentGroup);
    formData.append("name", trimmedName);
    formData.append("title", personForm.title.trim());
    formData.append("order", String(personForm.order));
    if (personPhoto) formData.append("photo", personPhoto);

    const url = editingPersonId ? `/api/about-people/${editingPersonId}` : "/api/about-people";
    const method = editingPersonId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetPersonForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save member details.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setPersonSaving(false);
  };

  const editPerson = (p: Person) => {
    setEditingPersonId(p._id);
    setPersonForm({
      name: p.name ?? "",
      title: p.title ?? "",
      order: p.order ?? 0,
    });
    setPersonPhoto(null);
  };

  const deletePerson = async (id: string) => {
    if (!confirm("Delete this person?")) return;
    try {
      const res = await fetch(`/api/about-people/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to delete person.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">About Page Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSubTab(tab);
              resetPersonForm();
              setErrorMsg(null);
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              subTab === tab ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {subTab === "History" && (
        <>
          <form onSubmit={submitHistory} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
            <h2 className="font-medium text-lg">{editingHistoryId ? "Edit Entry" : "Add History Entry"}</h2>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                required
                placeholder="Year (e.g. 1984)"
                value={historyForm.year}
                onChange={(e) => setHistoryForm({ ...historyForm, year: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Title"
                value={historyForm.title}
                onChange={(e) => setHistoryForm({ ...historyForm, title: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Order"
                value={historyForm.order}
                onChange={(e) => setHistoryForm({ ...historyForm, order: Number(e.target.value) })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <textarea
              required
              placeholder="Description"
              rows={2}
              value={historyForm.description}
              onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
              {editingHistoryId ? "Update" : "Add"}
            </button>
          </form>

          <div className="space-y-2">
            {history.map((h) => (
              <div key={h._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-serif font-bold text-green-700 w-16">{h.year}</span>
                <div className="flex-1">
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-gray-500">{h.description}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingHistoryId(h._id);
                    setHistoryForm({ year: h.year, title: h.title, description: h.description, order: h.order });
                  }}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteHistory(h._id)}
                  className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Vision Tab */}
      {subTab === "Vision" && (
        <form onSubmit={submitVision} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Heading"
            value={visionForm.heading}
            onChange={(e) => setVisionForm({ ...visionForm, heading: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Description"
            rows={4}
            value={visionForm.description}
            onChange={(e) => setVisionForm({ ...visionForm, description: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          {vision?.image && (
            <div className="relative w-full h-40 rounded overflow-hidden bg-gray-100">
              <Image src={vision.image} alt={vision.heading || "Vision image"} fill className="object-cover" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setVisionImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {vision ? "Update" : "Create"}
          </button>
        </form>
      )}

      {/* Aim & Objective Tab */}
      {subTab === "Aim & Objective" && (
        <form onSubmit={submitAim} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aim</label>
            <textarea
              required
              rows={3}
              value={aimText}
              onChange={(e) => setAimText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Objectives</label>
              <button
                type="button"
                onClick={() => setObjectives([...objectives, { title: "", description: "" }])}
                className="text-sm text-green-600 hover:underline"
              >
                + Add objective
              </button>
            </div>
            <div className="space-y-3">
              {objectives.map((obj, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={obj.title}
                    onChange={(e) => updateObjective(i, "title", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Description"
                    value={obj.description}
                    onChange={(e) => updateObjective(i, "description", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700">
            {aim ? "Update" : "Create"}
          </button>
        </form>
      )}

      {/* Org Structure Tab */}
      {subTab === "Org Structure" && (
        <form onSubmit={submitOrgStructure} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="font-medium text-lg">Organizational Structure Chart</h2>
          {orgStructure?.image && (
            <div className="relative w-full h-64 rounded overflow-hidden bg-gray-100">
              <Image src={orgStructure.image} alt="Organizational structure chart" fill className="object-contain" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setOrgImage(e.target.files?.[0] || null)} className="w-full text-sm" />
          <button
            type="submit"
            disabled={orgSaving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {orgSaving ? "Saving..." : orgStructure ? "Update" : "Create"}
          </button>
        </form>
      )}

      {/* Founder Member, EC Members, & GB Members Tabs */}
      {(subTab === "Founder Member" || subTab === "EC Members" || subTab === "GB Members") && (
        <>
          <form onSubmit={submitPerson} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-8">
            <h2 className="font-medium text-lg">
              {editingPersonId ? "Edit" : "Add"} — {subTab}
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. Dr. Mohammad Yousuf Ali"
                value={personForm.name}
                onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Ex-Chairman, EC, BMSRI"
                  value={personForm.title}
                  onChange={(e) => setPersonForm({ ...personForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={personForm.order}
                  onChange={(e) => setPersonForm({ ...personForm, order: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Photo {editingPersonId ? "(leave empty to keep current)" : <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPersonPhoto(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={personSaving}
                className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {personSaving ? "Saving..." : editingPersonId ? "Update" : "Add"}
              </button>
              {editingPersonId && (
                <button
                  type="button"
                  onClick={resetPersonForm}
                  className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Cards List */}
          <div className="grid grid-cols-3 gap-4">
            {people
              .filter((p) => p.group === currentGroup)
              .map((p) => (
                <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="relative w-full h-28 rounded overflow-hidden mb-2 bg-gray-100">
                    {p.photo ? (
                      <Image src={p.photo} alt={p.name || "Member photo"} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                  <p className="font-medium text-sm text-gray-900">
                    {p.name || "Unnamed Member"}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{p.title || "—"}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPerson(p)}
                      className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePerson(p._id)}
                      className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            {people.filter((p) => p.group === currentGroup).length === 0 && (
              <p className="text-sm text-gray-400 col-span-3">No entries yet — add one above.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}