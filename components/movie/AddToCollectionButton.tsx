"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ListPlus, Check, Plus, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Collection {
  id: string;
  name: string;
}

interface AddToCollectionButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
}

export function AddToCollectionButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
}: AddToCollectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections/mine");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections ?? []);
        setAdded(new Set(data.addedCollectionIds ?? []));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && collections.length === 0) {
      fetchCollections();
    }
  };

  const toggle = async (collectionId: string) => {
    const isAdded = added.has(collectionId);
    const method = isAdded ? "DELETE" : "POST";

    const optimistic = new Set(added);
    if (isAdded) {
      optimistic.delete(collectionId);
    } else {
      optimistic.add(collectionId);
    }
    setAdded(optimistic);

    await fetch("/api/collections", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionId,
        tmdbId,
        mediaType,
        title,
        posterPath: posterPath ?? null,
      }),
    }).catch(() => {
      // Revert on failure
      setAdded(added);
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm font-medium text-white transition hover:bg-surface2 hover:border-accent/30"
      >
        <ListPlus size={16} />
        Collections
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-64 overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/60 ring-1 ring-white/10"
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted">
                Add to Collection
              </p>

              {loading ? (
                <div className="py-4 text-center text-xs text-muted">Loading...</div>
              ) : collections.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted">No collections yet</p>
                  <Link
                    href="/collections/new"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <Plus size={12} />
                    Create one
                  </Link>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {collections.map((col) => {
                    const isIn = added.has(col.id);
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggle(col.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                          isIn
                            ? "bg-accent/10 text-accent"
                            : "text-white hover:bg-surface2"
                        }`}
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                          isIn
                            ? "border-accent bg-accent text-background"
                            : "border-white/20"
                        }`}>
                          {isIn && <Check size={12} />}
                        </div>
                        <span className="truncate">{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-white/5 p-2 pt-2">
                <Link
                  href="/collections/new"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition hover:bg-surface2 hover:text-white"
                >
                  <Plus size={14} />
                  New Collection
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
