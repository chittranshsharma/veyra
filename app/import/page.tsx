"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PosterCard } from "@/components/movie/PosterCard";
import type { TMDBListItem } from "@/lib/tmdb/client";
import { buttonVariants } from "@/components/ui/Button";
import {
  Download,
  CheckCircle2,
  Sparkles,
  Play,
  Library,
  Bookmark,
  FileSpreadsheet,
  Link2,
  UploadCloud,
} from "lucide-react";

export default function ImportPage() {
  const [importMode, setImportMode] = useState<"url" | "csv">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [target, setTarget] = useState<"collection" | "watchlist">("collection");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface ImportResult {
    listTitle?: string;
    totalParsed: number;
    resolvedCount: number;
    skippedDuplicates?: number;
    items: TMDBListItem[];
    savedCollectionId?: string;
    target: "collection" | "watchlist";
  }

  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (importMode === "url") {
        if (!url.trim()) return;
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
      } else {
        if (!selectedFile) {
          throw new Error("Please select a CSV file to import.");
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("target", target);
        formData.append("collectionName", selectedFile.name.replace(/\.[^/.]+$/, ""));

        const res = await fetch("/api/import/csv", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to parse CSV file");
        }

        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while importing.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleExample = (sampleUrl: string) => {
    setImportMode("url");
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
          Import Letterboxd &amp; IMDb
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          Paste any public list link or upload your official Letterboxd <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">watched.csv</code>. Veyra automatically resolves each film against high-resolution streaming metadata and converts it into a playable collection in seconds.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-surface/80 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setImportMode("url")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              importMode === "url"
                ? "bg-accent text-background shadow-md"
                : "text-text-muted hover:text-white"
            }`}
          >
            <Link2 size={14} />
            Public List URL
          </button>
          <button
            type="button"
            onClick={() => setImportMode("csv")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              importMode === "csv"
                ? "bg-accent text-background shadow-md"
                : "text-text-muted hover:text-white"
            }`}
          >
            <FileSpreadsheet size={14} />
            Letterboxd CSV File
          </button>
        </div>
      </div>

      {/* Import Form Card */}
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <form onSubmit={handleImport} className="space-y-4">
          {importMode === "url" ? (
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
                  className={buttonVariants({ variant: "primary", size: "sm", className: "absolute right-2" })}
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
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center justify-between">
                <span>Upload Letterboxd Export CSV</span>
                <span className="text-[11px] text-accent/80 font-normal">watched.csv, diary.csv, etc.</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:border-accent transition bg-surface2/40 space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-muted">{(selectedFile.size / 1024).toFixed(1)} KB · Ready to import</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white">Click or drag &amp; drop your CSV file here</p>
                    <p className="text-xs text-muted">Exported from Settings &gt; Data &gt; Export Your Data on Letterboxd</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className={buttonVariants({ variant: "primary", size: "lg", className: "w-full mt-2" })}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Parsing &amp; Resolving Titles...
                  </span>
                ) : (
                  <>
                    <Download size={15} />
                    Import CSV to Veyra
                  </>
                )}
              </button>
            </div>
          )}

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
        {importMode === "url" && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted/80 text-[11px]">Quick test:</span>
            <button
              type="button"
              onClick={() => handleExample("https://letterboxd.com/chittransh/watchlist/")}
              className="rounded-lg bg-surface2 px-2.5 py-1 text-text-secondary hover:text-white hover:bg-white/10 transition font-mono text-[11px]"
            >
              Letterboxd Watchlist
            </button>
            <button
              type="button"
              onClick={() => handleExample("https://www.imdb.com/list/ls000000000/")}
              className="rounded-lg bg-surface2 px-2.5 py-1 text-text-secondary hover:text-white hover:bg-white/10 transition font-mono text-[11px]"
            >
              IMDb List
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Loading Progress State */}
      {loading && (
        <div className="text-center py-10 space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm font-semibold text-white">Matching titles against cinema database...</p>
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
                  {result.listTitle || "Import Completed"}
                </h2>
                <p className="text-xs text-muted">
                  Successfully imported{" "}
                  <span className="text-white font-semibold">{result.resolvedCount}</span> of{" "}
                  {result.totalParsed} titles
                  {result.skippedDuplicates ? ` (${result.skippedDuplicates} duplicates skipped)` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {result.items.length > 0 && result.items[0] && (
                <Link
                  href={`/watch/movie/${result.items[0].id}`}
                  className={buttonVariants({ variant: "primary", size: "md" })}
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
