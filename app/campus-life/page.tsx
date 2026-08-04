"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Card = { _id: string; label: string; image: string; order: number };
type Content = { _id: string; headingPlain: string; headingHighlight: string; description: string };

const emptyContentForm = { headingPlain: "", headingHighlight: "", description: "" };
const emptyCardForm = { label: "", order: 0 };

export default function CampusLifeAdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [contentSaving, setContentSaving] = useState(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [cardForm, setCardForm] = useState(emptyCardForm);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardSaving, setCardSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contentRes, cardsRes] = await Promise.all([
        fetch("/api/campus-life").then((r) => r.json()),
        fetch("/api/campus-life-cards").then((r) => r.json()),
      ]);
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
        setContentForm({
          headingPlain: contentRes.data.headingPlain,
          headingHighlight: contentRes.data.headingHighlight,
          description: contentRes.data.description,
        });
      }
      if (cardsRes.success) setCards(cardsRes.data);
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
    setContentSaving(true);
    const method = content ? "PUT" : "POST";
    try {
      const res = await fetch("/api/campus-life", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm),
      });
      const json = await res.json();
      if (json.success) fetchAll();
      else setErrorMsg(json.error || "Failed to save");
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setContentSaving(false);
  };

  const resetCardForm = () => {
    setCardForm(emptyCardForm);
    setCardFile(null);
    setEditingCardId(null);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingCardId && !cardFile) {
      alert("Please choose an image for a new card.");
      return;
    }

    setCardSaving(true);
    const formData = new FormData();
    formData.append("label", cardForm.label);
    formData.append("order", String(cardForm.order));
    if (cardFile) formData.append("image", cardFile);

    const url = editingCardId ? `/api/campus-life-cards/${editingCardId}` : "/api/campus-life-cards";
    const method = editingCardId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (json.success) {
        resetCardForm();
        fetchAll();
      } else {
        setErrorMsg(json.error || "Failed to save card");
      }
    } catch (err: any) {
      setErrorMsg(`Request failed: ${err.message}`);
    }
    setCardSaving(false);
  };

  const handleCardEdit = (card: Card) => {
    setEditingCardId(card._id);
    setCardForm({ label: card.label, order: card.order });
    setCardFile(null);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleCardDelete = async (id: string) => {
    if (!confirm("Delete this card?")) return;
    const res = await fetch(`/api/campus-life-cards/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) fetchAll();
    else setErrorMsg(json.error || "Delete failed");
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Campus Life</h1>

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
            <h2 className="font-medium text-lg">Heading & Description</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heading (plain)</label>
                <input type="text" required value={contentForm.headingPlain} onChange={(e) => setContentForm({ ...contentForm, headingPlain: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Campus" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heading (highlight)</label>
                <input type="text" required value={contentForm.headingHighlight} onChange={(e) => setContentForm({ ...contentForm, headingHighlight: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Life" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea required rows={3} value={contentForm.description} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={contentSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {contentSaving ? "Saving..." : content ? "Update" : "Create"}
            </button>
          </form>

          <form onSubmit={handleCardSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-10">
            <h2 className="font-medium text-lg">{editingCardId ? "Edit Card" : "Add New Card"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input type="text" required value={cardForm.label} onChange={(e) => setCardForm({ ...cardForm, label: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Student Life" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input type="number" value={cardForm.order} onChange={(e) => setCardForm({ ...cardForm, order: Number(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image {editingCardId && "(leave empty to keep current)"}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setCardFile(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={cardSaving} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {cardSaving ? "Saving..." : editingCardId ? "Update Card" : "Add Card"}
              </button>
              {editingCardId && (
                <button type="button" onClick={resetCardForm} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2 className="font-medium text-lg mb-4">All Cards</h2>
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative w-28 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
                  <Image src={card.image} alt={card.label} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Order: {card.order}</p>
                  <p className="font-medium">{card.label}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleCardEdit(card)} className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleCardDelete(card._id)} className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
            {cards.length === 0 && <p className="text-sm text-gray-400">No cards yet — add one above.</p>}
          </div>
        </>
      )}
    </main>
  );
}
