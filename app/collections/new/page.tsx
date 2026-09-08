"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock, List, Plus } from "lucide-react";

export default function NewCollectionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/collections/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null, isPublic }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/collections/${data.id}`);
  };

  return (
    <main className="min-h-screen pb-20 pt-12">
      <div className="mx-auto max-w-lg px-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <List size={20} />
          </div>
          <div>
            <h1 className="gradient-heading font-display text-2xl font-bold">New Collection</h1>
            <p className="text-sm text-muted">Curate your perfect watchlist</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="col-name" className="text-sm font-medium text-white">
              Collection Name <span className="text-accent">*</span>
            </label>
            <input
              id="col-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mind-Bending Sci-Fi"
              maxLength={80}
              required
              className="w-full rounded-xl bg-surface2 px-4 py-3 text-sm text-white placeholder-muted outline-none ring-1 ring-white/10 transition focus:ring-accent/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="col-desc" className="text-sm font-medium text-white">
              Description <span className="text-muted text-xs">(optional)</span>
            </label>
            <textarea
              id="col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              maxLength={300}
              rows={3}
              className="w-full resize-none rounded-xl bg-surface2 px-4 py-3 text-sm text-white placeholder-muted outline-none ring-1 ring-white/10 transition focus:ring-accent/50"
            />
          </div>

          {/* Visibility toggle */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Visibility</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                  isPublic
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-white/10 text-muted hover:text-white"
                }`}
              >
                <Globe size={15} />
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                  !isPublic
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-white/10 text-muted hover:text-white"
                }`}
              >
                <Lock size={15} />
                Private
              </button>
            </div>
            <p className="text-xs text-muted">
              {isPublic
                ? "Anyone can discover and view this collection."
                : "Only you can see this collection."}
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-shimmer w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            {loading ? "Creating..." : "Create Collection"}
          </button>
        </form>
      </div>
    </main>
  );
}
