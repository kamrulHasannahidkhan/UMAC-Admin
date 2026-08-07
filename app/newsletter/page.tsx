"use client";

import { useEffect, useState } from "react";

type Subscriber = { _id: string; email: string; createdAt: string };

export default function NewsletterAdminPage() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    const res = await fetch("/api/newsletter");
    const json = await res.json();
    if (json.success) setSubs(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
    fetchSubs();
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">Newsletter Subscribers</h1>
      <p className="text-sm text-gray-500 mb-6">{subs.length} total subscriber{subs.length !== 1 && "s"}</p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {subs.map((s) => (
            <div key={s._id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-sm">{s.email}</p>
                <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(s._id)} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
          {subs.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">No subscribers yet.</p>}
        </div>
      )}
    </main>
  );
}
