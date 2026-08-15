"use client";

import { useEffect, useState } from "react";

type AccordionItem = {
  group?: string;
  title: string;
  description: string;
  image?: string;
  order: number;
};

type FacilityAccordionDoc = {
  _id: string;
  section: string;
  heading: string;
  description?: string;
  items: AccordionItem[];
};

// Expanded list matching all 10 facility routes from your sidebar
const SECTIONS = [
  { label: "Hospital Service", value: "hospital-service" },
  { label: "Departments", value: "departments" },
  { label: "Library", value: "library" },
  { label: "Medical Education Unit", value: "medical-education-unit" },
  { label: "Training", value: "training" },
  { label: "Publications", value: "publications" },
  { label: "Seminar", value: "seminar" },
  { label: "Hostel", value: "hostel" },
  { label: "Laboratory", value: "laboratory" },
  { label: "Cafeteria", value: "cafeteria" },
] as const;

export default function FacilityAccordionAdmin() {
  const [section, setSection] = useState<(typeof SECTIONS)[number]["value"]>("hospital-service");
  const [doc, setDoc] = useState<FacilityAccordionDoc | null>(null);
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<AccordionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDoc = async (sec: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/facility-accordion?section=${sec}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDoc(json.data);
        setHeading(json.data.heading || "");
        setDescription(json.data.description || "");
        setItems(json.data.items || []);
      } else {
        setDoc(null);
        setHeading("");
        setDescription("");
        setItems([]);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load content: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc(section);
  }, [section]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const method = doc ? "PUT" : "POST";

    try {
      const res = await fetch("/api/facility-accordion", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, heading: heading.trim(), description: description.trim(), items }),
      });
      const json = await res.json();
      if (json.success) {
        fetchDoc(section);
      } else {
        setErrorMsg(json.error || "Failed to save content.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (i: number, field: keyof AccordionItem, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: field === "order" ? Number(value) : value };
    setItems(next);
  };

  const addItem = () =>
    setItems([...items, { group: "", title: "", description: "", image: "", order: items.length }]);

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Facility Sections Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SECTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              setSection(s.value);
              setErrorMsg(null);
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              section === s.value ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading section details...</p>
      ) : (
        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              type="text"
              required
              placeholder="Heading (e.g. Modern Cafeteria Services)"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Intro description for this facility section"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Accordion Items</label>
              <button type="button" onClick={addItem} className="text-sm text-green-600 font-medium hover:underline">
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Group label (optional, e.g. Overview)"
                      value={item.group || ""}
                      onChange={(e) => updateItem(i, "group", e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Item Title"
                      value={item.title}
                      onChange={(e) => updateItem(i, "title", e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Description text"
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-3">
                    <input
                      type="text"
                      placeholder="Image URL (Cloudinary or public link)"
                      value={item.image || ""}
                      onChange={(e) => updateItem(i, "image", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={item.order}
                      onChange={(e) => updateItem(i, "order", e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-xs px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : doc ? "Update Section" : "Create Section"}
          </button>
        </form>
      )}
    </main>
  );
}