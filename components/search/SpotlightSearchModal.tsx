"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Star } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";

interface ResultItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

const TRENDING_FALLBACK: ResultItem[] = [
  { id: 1022789, title: "Inside Out 2", media_type: "movie", vote_average: 7.6, release_date: "2024-06-14" },
  { id: 278, title: "The Shawshank Redemption", media_type: "movie", vote_average: 8.7, release_date: "1994-09-23" },
  { id: 1396, name: "Breaking Bad", media_type: "tv", vote_average: 9.5, first_air_date: "2008-01-20" },
  { id: 76600, title: "Avatar: The Way of Water", media_type: "movie", vote_average: 7.6, release_date: "2022-12-16" },
  { id: 94997, name: "House of the Dragon", media_type: "tv", vote_average: 8.4, first_air_date: "2022-08-21" },
  { id: 315162, title: "Puss in Boots: The Last Wish", media_type: "movie", vote_average: 8.1, release_date: "2022-12-21" },
];

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightSearchModal({ isOpen, onClose }: SpotlightSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [trending, setTrending] = useState<ResultItem[]>(TRENDING_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Fetch trending on open
  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setResults([]);
    setActiveIdx(-1);
    setTimeout(() => inputRef.current?.focus(), 80);
    document.body.style.overflow = "hidden";
    // Try to load real trending
    fetch("/api/tmdb/popular?type=movie&page=1")
      .then((r) => r.json())
      .then((d) => { if (d.results?.length) setTrending(d.results.slice(0, 6)); })
      .catch(() => {});

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // Live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query.trim())}&limit=8`);
        const d = await r.json();
        setResults(d.results ?? []);
        setActiveIdx(-1);
      } catch {}
      setLoading(false);
    }, 280);
  }, [query]);

  const displayItems = query.trim() ? results : trending;

  const navigateTo = useCallback((item: ResultItem) => {
    const mt = item.media_type ?? (item.title ? "movie" : "tv");
    router.push(`/${mt}/${item.id}`);
    onClose();
  }, [router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, displayItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && displayItems[activeIdx]) {
        navigateTo(displayItems[activeIdx]);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-2xl mt-[10vh]"
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div
              className="rounded-2xl border border-border shadow-2xl overflow-hidden"
              style={{ background: "var(--glass-bg)", backdropFilter: "blur(24px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={18} className="text-text-muted shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search movies & TV shows..."
                  className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query ? (
                  <button onClick={() => setQuery("")} className="text-text-muted hover:text-text-primary transition">
                    <X size={16} />
                  </button>
                ) : (
                  <button onClick={onClose} className="flex h-7 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium text-text-muted hover:text-text-primary transition">
                    Esc
                  </button>
                )}
              </div>

              {!query.trim() && (
                <p className="px-4 py-1 text-[11px] text-text-muted">Press Enter to see all results</p>
              )}

              {/* Results / Trending */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Section label */}
                {!query.trim() && (
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                    <TrendingUp size={13} className="text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-widest">Trending</span>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="px-4 py-6 text-center text-sm text-text-muted">Searching…</div>
                )}

                {/* Items */}
                {!loading && displayItems.map((item, i) => {
                  const title = item.title ?? item.name ?? "Unknown";
                  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
                  const mt = item.media_type ?? (item.title ? "movie" : "tv");
                  const poster = tmdbImage(item.poster_path, "w92");
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                        isActive ? "bg-accent/10" : "hover:bg-surface2/60"
                      }`}
                    >
                      <div className="shrink-0 w-10 h-[60px] rounded-lg overflow-hidden border border-border bg-surface2">
                        {poster ? (
                          <Image src={poster} alt={title} width={40} height={60} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
                        <p className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                          <span className="tabular-nums">{year}</span>
                          {item.vote_average ? (
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Star size={10} fill="currentColor" />
                              {item.vote_average.toFixed(1)}
                            </span>
                          ) : null}
                          <span className="uppercase font-bold tracking-wide text-[10px]">{mt}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}

                {!loading && query.trim() && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-text-muted">
                    No results for &ldquo;<span className="text-text-secondary">{query}</span>&rdquo;
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
