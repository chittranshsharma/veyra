"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Play, Info, X, Send, Zap, Star, Compass } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";

interface EnrichedAiItem {
  id: number;
  title: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  overview?: string;
  matchReason: string;
}

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_VIBES = [
  { emoji: "🌌", text: "Mind-bending sci-fi with insane plot twists" },
  { emoji: "🌧️", text: "Cozy animated comfort movie for a rainy night" },
  { emoji: "🏎️", text: "Adrenaline-fueled heist thriller with intense suspense" },
  { emoji: "🕯️", text: "Slow-burn psychological dread and mystery" },
  { emoji: "🍷", text: "Date night movie that is smart, funny, and warm" },
];

export function AiConciergeModal({ isOpen, onClose }: AiConciergeModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [curatorNote, setCuratorNote] = useState<string | null>(null);
  const [items, setItems] = useState<EnrichedAiItem[]>([]);
  const [isLiveGroq, setIsLiveGroq] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = async (searchPrompt: string) => {
    if (!searchPrompt.trim() || loading) return;
    setLoading(true);
    setItems([]);
    setCuratorNote(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchPrompt.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCuratorNote(data.curatorNote);
        setItems(data.items ?? []);
        setIsLiveGroq(data.isLiveGroq ?? false);
      }
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(prompt);
  };

  const handlePresetClick = (presetText: string) => {
    setPrompt(presetText);
    handleSearch(presetText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/95 shadow-2xl shadow-accent/10 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-purple-500 text-background shadow-lg shadow-accent/25">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-white">
                      Veyra AI Concierge
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30">
                      <Zap size={10} fill="currentColor" />
                      Groq LPU
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Instant natural language movie & series discovery
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-muted transition hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Natural language input */}
              <form onSubmit={onSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your mood, a scene you recall, or two movies combined..."
                  className="w-full rounded-2xl border border-white/10 bg-surface2/80 py-4 pl-4 pr-12 text-sm text-white placeholder-muted shadow-inner focus:border-accent/60 focus:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-background transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                  aria-label="Search vibe"
                >
                  <Send size={15} />
                </button>
              </form>

              {/* Preset Vibe Chips */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Compass size={13} />
                  Try a curated vibe:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_VIBES.map((pv) => (
                    <button
                      key={pv.text}
                      type="button"
                      onClick={() => handlePresetClick(pv.text)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-surface2/50 px-3 py-1.5 text-xs text-white/80 transition hover:border-accent/40 hover:bg-surface2 hover:text-white"
                    >
                      <span>{pv.emoji}</span>
                      <span>{pv.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="space-y-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent border border-accent/30 animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    Groq LPU is analyzing cinema knowledge in &lt;300ms...
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="skeleton h-32 rounded-2xl border border-white/5 p-4"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {!loading && items.length > 0 && (
                <div className="space-y-4">
                  {curatorNote && (
                    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1 flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Curator Analysis
                      </p>
                      <p className="text-sm font-medium text-white/90 leading-relaxed">
                        &ldquo;{curatorNote}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {items.map((item) => {
                      const poster = tmdbImage(item.poster_path, "w300");
                      const year = item.release_date?.split("-")[0];
                      const watchHref =
                        item.media_type === "tv"
                          ? `/watch/tv/${item.id}/1/1`
                          : `/watch/movie/${item.id}`;
                      const detailHref = `/${item.media_type}/${item.id}`;

                      return (
                        <div
                          key={`${item.media_type}-${item.id}`}
                          className="group relative flex gap-3.5 rounded-2xl border border-white/10 bg-surface2/60 p-3 transition hover:border-accent/40 hover:bg-surface2"
                        >
                          {/* Poster thumbnail */}
                          <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                            {poster ? (
                              <Image
                                src={poster}
                                alt={item.title}
                                fill
                                sizes="80px"
                                className="object-cover transition group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                                No image
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex flex-1 flex-col justify-between overflow-hidden">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="truncate font-display text-sm font-bold text-white group-hover:text-accent transition-colors">
                                  {item.title}
                                </h3>
                              </div>

                              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                                {year && <span>{year}</span>}
                                <span className="uppercase text-[9px] bg-white/10 px-1 py-0.2 rounded font-semibold text-white">
                                  {item.media_type}
                                </span>
                                {item.vote_average > 0 && (
                                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                    <Star size={10} fill="currentColor" />
                                    {item.vote_average.toFixed(1)}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-xs text-white/80 leading-snug line-clamp-2 italic">
                                &ldquo;{item.matchReason}&rdquo;
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 flex items-center gap-2">
                              <Link
                                href={watchHref}
                                onClick={onClose}
                                className="btn-shimmer flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-1.5 text-xs font-bold text-background transition hover:brightness-110"
                              >
                                <Play size={12} fill="currentColor" />
                                Play Now
                              </Link>
                              <Link
                                href={detailHref}
                                onClick={onClose}
                                className="flex items-center justify-center rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                                title="Details"
                              >
                                <Info size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
