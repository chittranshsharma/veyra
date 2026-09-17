"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Search, Play, Info, Star } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { tmdbImage } from "@/lib/tmdb/image";

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
}

export function BecauseYouWatched() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TMDBItem[]>([]);
  const [selected, setSelected] = useState<TMDBItem | null>(null);
  const [recommendations, setRecommendations] = useState<TMDBItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const searchTitles = useDebouncedCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}&limit=6`);
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions((data.results ?? []).slice(0, 6));
      setShowSuggestions(true);
    } catch {}
  }, 300);

  const loadRecommendations = useCallback(async (item: TMDBItem) => {
    const mediaType = item.media_type ?? (item.title ? "movie" : "tv");
    setLoadingRecs(true);
    setRecommendations([]);
    try {
      const [recRes, simRes] = await Promise.all([
        fetch(`/api/tmdb/recommendations?id=${item.id}&type=${mediaType}`),
        fetch(`/api/tmdb/similar?id=${item.id}&type=${mediaType}`),
      ]);
      const recData = recRes.ok ? await recRes.json() : { results: [] };
      const simData = simRes.ok ? await simRes.json() : { results: [] };
      const merged: TMDBItem[] = [
        ...(recData.results ?? []).map((r: TMDBItem) => ({ ...r, media_type: mediaType })),
        ...(simData.results ?? []).map((r: TMDBItem) => ({ ...r, media_type: mediaType })),
      ];
      // Deduplicate
      const seen = new Set<number>();
      const unique = merged.filter((r) => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
      setRecommendations(unique.slice(0, 16));
    } catch {
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  const handleSelect = (item: TMDBItem) => {
    setSelected(item);
    setQuery(item.title ?? item.name ?? "");
    setSuggestions([]);
    setShowSuggestions(false);
    loadRecommendations(item);
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setRecommendations([]);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
      {/* Header */}
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-1">
        — POST-BINGE RECOVERY
      </p>
      <h2 className="font-display text-3xl sm:text-4xl font-black text-text-primary leading-tight mb-1">
        Because you watched…
      </h2>
      <p className="text-sm text-text-muted mb-6">
        finished something good? type it in and we&apos;ll go from there
      </p>

      {/* Search input */}
      <div ref={wrapperRef} className="relative w-full max-w-2xl">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-all focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20">
          <Play size={16} className="text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchTitles(e.target.value);
            }}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
            placeholder="I just finished… The Sopranos, Inception, Breaking Bad…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
          />
          {query && (
            <button onClick={handleClear} className="text-text-muted hover:text-text-primary transition-colors shrink-0">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {suggestions.map((item) => {
              const t = item.title ?? item.name ?? "";
              const yr = item.release_date?.split("-")[0] ?? item.first_air_date?.split("-")[0];
              const mt = item.media_type ?? (item.title ? "movie" : "tv");
              const thumb = tmdbImage(item.poster_path, "w92");
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-surface2 transition-colors text-left"
                >
                  {thumb ? (
                    <div className="relative h-10 w-7 shrink-0 rounded overflow-hidden bg-surface2">
                      <Image src={thumb} alt={t} fill className="object-cover" sizes="28px" />
                    </div>
                  ) : (
                    <div className="h-10 w-7 shrink-0 rounded bg-surface2 flex items-center justify-center">
                      <Search size={12} className="text-text-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{t}</p>
                    <p className="text-[11px] text-text-muted">{yr} · {mt === "tv" ? "TV Series" : "Film"}</p>
                  </div>
                  {item.vote_average > 0 && (
                    <span className="ml-auto text-[11px] font-bold text-amber-400 flex items-center gap-1 shrink-0">
                      <Star size={10} fill="currentColor" /> {item.vote_average.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations Rail */}
      {(loadingRecs || recommendations.length > 0) && (
        <div className="mt-8">
          {selected && (
            <p className="text-sm text-text-muted mb-4">
              Because you watched{" "}
              <span className="text-text-primary font-semibold">
                {selected.title ?? selected.name}
              </span>
              …
            </p>
          )}
          <div className="rail flex gap-4 overflow-x-auto pb-3">
            {loadingRecs
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[140px] sm:w-[160px]">
                    <div className="skeleton aspect-[2/3] w-full rounded-xl" />
                    <div className="mt-2 skeleton h-3 w-3/4 rounded" />
                  </div>
                ))
              : recommendations.map((item) => {
                  const t = item.title ?? item.name ?? "";
                  const yr = item.release_date?.split("-")[0] ?? item.first_air_date?.split("-")[0];
                  const mt = item.media_type ?? (item.title ? "movie" : "tv");
                  const poster = tmdbImage(item.poster_path, "w300");
                  const watchHref = mt === "tv" ? `/watch/tv/${item.id}/1/1` : `/watch/movie/${item.id}`;
                  const detailHref = `/${mt}/${item.id}`;
                  return (
                    <div key={item.id} className="group shrink-0 w-[140px] sm:w-[160px]">
                      <Link href={detailHref} className="block relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-border bg-surface2 hover:border-accent/50 transition-all hover:shadow-[0_8px_24px_var(--accent-dim)]">
                        {poster && (
                          <Image src={poster} alt={t} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="160px" />
                        )}
                        {/* Quick play overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                          <Link
                            href={watchHref}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 flex items-center justify-center h-10 w-10 rounded-full bg-accent text-[var(--on-accent)] shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Play ${t}`}
                          >
                            <Play size={14} fill="currentColor" />
                          </Link>
                        </div>
                      </Link>
                      <div className="mt-2 px-0.5">
                        <p className="truncate text-[13px] font-semibold text-text-primary">{t}</p>
                        <p className="text-[11px] text-text-muted">{yr} · {mt === "tv" ? "Series" : "Film"}</p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </section>
  );
}
