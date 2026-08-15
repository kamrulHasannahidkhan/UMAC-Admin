"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Stat = { number: string; label: string };
type StatsContent = { _id: string; bgImage: string; stats: Stat[] };
const emptyStat: Stat = { number: "", label: "" };

// Exact structural + class match of client-site/components/StatsSection.tsx, scaled for preview.
function StatsPreview({ stats, bgImagePreviewUrl }: { stats: Stat[]; bgImagePreviewUrl: string | null }) {
  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Live Preview — exact client layout</p>

      <div className="relative w-full h-[160px] rounded-lg overflow-hidden bg-gray-800">
        {bgImagePreviewUrl && (
          <Image src={bgImagePreviewUrl} alt="preview" fill className="object-cover" unoptimized />
        )}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-3">
          <div className="w-full bg-green-700/70 rounded-md py-3 px-3 grid grid-cols-3 divide-x divide-white/30 text-center text-white">
            {stats.map((stat, i) => (
              <div key={i} className="px-2">
                <p className="text-lg font-serif leading-tight">{stat.number || "0"}</p>
                <p className="text-yellow-400 font-semibold text-[8px] leading-snug">{stat.label || "Label"}</p>
              </div>
            ))}
            {stats.length === 0 && <p className="text-[9px] col-span-3 text-white/70">Add stats to see preview</p>}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">Mirrors the real Stats banner — same colors and 3-column layout as the live site.</p>
    </div>
  );
}

export default function StatsAdminPage() {
  const [content, setContent] = useState<StatsContent | null>(null);
  const [stats, setStats] = useState<Stat[]>([{ ...emptyStat }]);
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [bgImagePreviewUrl, setBgImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (json?.success && json.data) {
        setContent(json.data);
        setStats(json.data.stats);
        setBgImagePreviewUrl(json.data.bgImage);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load stats: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (!bgImage) return;
    const url = URL.createObjectURL(bgImage);
    setBgImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bgImage]);

  const updateStat = (i: number, field: keyof Stat, value: string) => {
    const next = [...stats];
    next[i] = { ...next[i], [field]: value };
    setStats(next);
  };

  const addStat = () => setStats([...stats, { ...emptyStat }]);
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!content && !bgImage) {
      alert("Please choose a background image for the first-time setup.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("stats", JSON.stringify(stats));
    if (bgImage) formData.append("bgImage", bgImage);

    const method = content ? "PUT" : "POST";

    try {
      const res = await fetch("/api/stats", { method, body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (json?.success) {
        setBgImage(null);
        fetchContent();
      } else {
        setErrorMsg(json?.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }

    setSaving(false);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Stats Banner</h1>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4 mb-6 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Background image {content && "(leave empty to keep current)"}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Stats</label>
                <button type="button" onClick={addStat} className="text-sm text-green-600 hover:underline">
                  + Add stat
                </button>
              </div>
              <div className="space-y-3">
                {stats.map((stat, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <input
                      type="text"
                      required
                      value={stat.number}
                      onChange={(e) => updateStat(i, "number", e.target.value)}
                      className="w-28 border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="90%"
                    />
                    <input
                      type="text"
                      required
                      value={stat.label}
                      onChange={(e) => updateStat(i, "label", e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Post-Graduation Success Rate"
                    />
                    {stats.length > 1 && (
                      <button type="button" onClick={() => removeStat(i)} className="text-red-500 text-sm px-2 py-2 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : content ? "Update Stats" : "Create Stats"}
            </button>
          </form>

          <StatsPreview stats={stats} bgImagePreviewUrl={bgImagePreviewUrl} />
        </div>
      )}
    </main>
  );
}
