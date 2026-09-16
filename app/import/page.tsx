"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { PosterCard } from "@/components/movie/PosterCard";
import type { TMDBListItem } from "@/lib/tmdb/client";
import {
  Download,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Play,
  Library,
  Bookmark,
  ExternalLink,
  AlertCircle,
  Film,
} from "lucide-react";

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState<"collection" | "watchlist">("collection");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface ImportResult {
    listTitle: string;
    totalParsed: number;
    resolvedCount: number;
    items: TMDBListItem[];
    savedCollectionId?: string;
    target: "collection" | "watchlist";
  }

  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/import/letterboxd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), target }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import list");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while importing.");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 lg:px-16 max-w-7xl mx-auto space-y-10">
      {/* Hero Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent">
          <Sparkles size={13} />
          <span>One-Click Cinephile Sync</span>
        </div>
        <h1 className="gradient-heading font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
          Import Letterboxd & IMDb
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          Paste any public list or watchlist link. Veyra automatically resolves every movie against
          high-resolution streaming metadata and converts it into a playable collection in seconds.
        </p>
      </div>

      {/* Import Form Card */}
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center justify-between">
              <span>List or Watchlist URL</span>
              <span className="text-[11px] text-accent/80 font-normal">Public lists only</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="https://letterboxd.com/username/watchlist/ or https://boxd.it/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-white/15 bg-surface2/80 px-4 py-3.5 pr-28 text-sm text-white placeholder-muted/60 focus:border-accent focus:outline-none transition shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="absolute right-2 rounded-xl bg-accent px-5 py-2 text-xs font-bold text-background transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 flex items-center gap-1.5 shadow-md active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Syncing...
                  </span>
                ) : (
                  <>
                    <Download size={13} />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Import Destination Selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted font-medium">Save imported titles as:</span>
            <div className="flex items-center gap-2 bg-surface2/60 p-1 rounded-xl border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setTarget("collection")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                  target === "collection"
                    ? "bg-accent text-background shadow-sm"
                    : "text-muted hover:text-white"
                }`}
              >
                <Library size={12} />
                Playable Collection
              </button>
              <button
                type="button"
                onClick={() => setTarget("watchlist")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                  target === "watchlist"
                    ? "bg-accent text-background shadow-sm"
                    : "text-muted hover:text-white"
                }`}
              >
                <Bookmark size={12} />
                My Watchlist
              </button>
            </div>
          </div>
        </form>

        {/* Quick Example Pills */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted/80 text-[11px]">Quick test:</span>
          <button
            type="button"
            onClick={() => handleExample("https://letterboxd.com/dave/watchlist/")}
            className="rounded-lg bg-surface2 px-2.5 py-1 text-white/80 hover:bg-white/15 hover:text-white transition"
          >
            Dave Vis’s Watchlist
          </button>
          <button
            type="button"
            onClick={() => handleExample("https://letterboxd.com/jack/list/sci-fi-favourites/")}
            className="rounded-lg bg-surface2 px-2.5 py-1 text-white/80 hover:bg-white/15 hover:text-white transition"
          >
            Sci-Fi Favorites
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300"
          >
            <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Import Failed</p>
              <p className="text-red-300/80">{error}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading State Animation */}
      {loading && (
        <div className="py-12 text-center space-y-4 max-w-md mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30 animate-pulse">
            <Film size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-semibold text-white text-lg">
              Extracting & Matching Films...
            </h3>
            <p className="text-xs text-muted">
              Querying TMDB metadata and streaming endpoints for each title
            </p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4"
        >
          {/* Success Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-surface to-surface p-6 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-lg sm:text-xl">
                  {result.listTitle}
                </h2>
                <p className="text-xs text-muted">
                  Successfully imported{" "}
                  <span className="text-white font-semibold">{result.resolvedCount}</span> of{" "}
                  {result.totalParsed} titles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {result.items.length > 0 && result.items[0] && (
                <Link
                  href={`/watch/movie/${result.items[0].id}`}
                  className="btn-shimmer flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-background transition hover:brightness-110 active:scale-95 shadow-md"
                >
                  <Play size={13} fill="currentColor" />
                  Play First Movie
                </Link>
              )}
              {result.savedCollectionId ? (
                <Link
                  href={`/collections/${result.savedCollectionId}`}
                  className="flex items-center gap-1.5 rounded-xl bg-surface2 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition border border-white/10"
                >
                  <Library size={13} />
                  View Collection
                </Link>
              ) : (
                <Link
                  href="/watchlist"
                  className="flex items-center gap-1.5 rounded-xl bg-surface2 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition border border-white/10"
                >
                  <Bookmark size={13} />
                  View Watchlist
                </Link>
              )}
            </div>
          </div>

          {/* Imported Movies Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-white text-base">
                Imported Titles ({result.resolvedCount})
              </h3>
              <span className="text-xs text-muted">Click any poster to play</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {result.items.map((item, idx) => (
                <PosterCard
                  key={`imported-${item.id}-${idx}`}
                  item={item}
                  defaultMediaType="movie"
                  index={idx}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
