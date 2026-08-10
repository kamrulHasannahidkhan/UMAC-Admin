"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Item = { title: string; description: string; order: number };

type FacilityContentDoc = {
  _id: string;
  section: string;
  heading: string;
  description: string;
  image: string;
  stat1Label?: string;
  stat1Value?: string;
  stat2Label?: string;
  stat2Value?: string;
  items: Item[];
  items2: Item[];
};

const SECTIONS = [
  { label: "Hospital Service", value: "hospital", items1Label: "Facilities & Services", items2Label: "Medical Services" },
  { label: "Library", value: "library", items1Label: "Facilities & Resources", items2Label: "Academic Databases" },
  { label: "Medical Education Unit", value: "meu", items1Label: "Facilities & Resources", items2Label: "Academic Databases" },
  { label: "Training", value: "training", items1Label: "Programs Covered", items2Label: "Additional Notes" },
] as const;

const emptyForm = {
  heading: "",
  description: "",
  stat1Label: "",
  stat1Value: "",
  stat2Label: "",
  stat2Value: "",
};

export default function FacilityContentAdmin() {
  const [section, setSection] = useState<(typeof SECTIONS)[number]["value"]>("hospital");
  const [doc, setDoc] = useState<FacilityContentDoc | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<Item[]>([]);
  const [items2, setItems2] = useState<Item[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const current = SECTIONS.find((s) => s.value === section)!;

  const fetchDoc = async (sec: string) => {
    try {
      const res = await fetch(`/api/facility-content?section=${sec}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDoc(json.data);
        setForm({
          heading: json.data.heading,
          description: json.data.description,
          stat1Label: json.data.stat1Label || "",
          stat1Value: json.data.stat1Value || "",
          stat2Label: json.data.stat2Label || "",
          stat2Value: json.data.stat2Value || "",
        });
        setItems(json.data.items || []);
        setItems2(json.data.items2 || []);
      } else {
        setDoc(null);
        setForm(emptyForm);
        setItems([]);
        setItems2([]);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load content: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchDoc(section);
    setImage(null);
  }, [section]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!doc && !image) {
      alert("Please choose an image for first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("section", section);
    formData.append("heading", form.heading.trim());
    formData.append("description", form.description.trim());
    formData.append("stat1Label", form.stat1Label.trim());
    formData.append("stat1Value", form.stat1Value.trim());
    formData.append("stat2Label", form.stat2Label.trim());
    formData.append("stat2Value", form.stat2Value.trim());
    formData.append("items", JSON.stringify(items));
    formData.append("items2", JSON.stringify(items2));
    if (image) formData.append("image", image);

    const method = doc ? "PUT" : "POST";

    try {
      const res = await fetch("/api/facility-content", { method, body: formData });
      const json = await res.json();
      if (json.success) {
        setImage(null);
        fetchDoc(section);
      } else {
        setErrorMsg(json.error || "Failed to save content.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  const updateItem = (list: "items" | "items2", i: number, field: keyof Item, value: string) => {
    const setter = list === "items" ? setItems : setItems2;
    const source = list === "items" ? items : items2;
    const next = [...source];
    next[i] = { ...next[i], [field]: field === "order" ? Number(value) : value };
    setter(next);
  };

  const addItem = (list: "items" | "items2") => {
    const setter = list === "items" ? setItems : setItems2;
    const source = list === "items" ? items : items2;
    setter([...source, { title: "", description: "", order: source.length }]);
  };

  const removeItem = (list: "items" | "items2", i: number) => {
    const setter = list === "items" ? setItems : setItems2;
    const source = list === "items" ? items : items2;
    setter(source.filter((_, idx) => idx !== i));
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Facility Content Admin</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-4 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        {SECTIONS.map((s) => (
          <button
            key={s.value}
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

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <input
          type="text"
          required
          placeholder="Heading"
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <textarea
          required
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />

        {doc?.image && (
          <div className="relative w-full h-40 rounded overflow-hidden bg-gray-100">
            <Image src={doc.image} alt={doc.heading} fill className="object-cover" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            Image {doc ? "(leave empty to keep current)" : <span className="text-red-500">*</span>}
          </label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Stat 1 Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. Total Land Area"
              value={form.stat1Label}
              onChange={(e) => setForm({ ...form, stat1Label: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            <input
              type="text"
              placeholder="e.g. 87,260.035"
              value={form.stat1Value}
              onChange={(e) => setForm({ ...form, stat1Value: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Stat 2 Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. Main Building"
              value={form.stat2Label}
              onChange={(e) => setForm({ ...form, stat2Label: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            <input
              type="text"
              placeholder="e.g. 17"
              value={form.stat2Value}
              onChange={(e) => setForm({ ...form, stat2Value: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">{current.items1Label}</label>
            <button type="button" onClick={() => addItem("items")} className="text-sm text-green-600 hover:underline">
              + Add item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <input
                  type="text"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateItem("items", i, "title", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem("items", i, "description", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem("items", i)}
                  className="px-2 py-2 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">{current.items2Label}</label>
            <button type="button" onClick={() => addItem("items2")} className="text-sm text-green-600 hover:underline">
              + Add item
            </button>
          </div>
          <div className="space-y-2">
            {items2.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <input
                  type="text"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateItem("items2", i, "title", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem("items2", i, "description", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem("items2", i)}
                  className="px-2 py-2 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : doc ? "Update" : "Create"}
        </button>
      </form>
    </main>
  );
}
