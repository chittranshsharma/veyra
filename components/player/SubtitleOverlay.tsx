"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Subtitles,
  Upload,
  Settings2,
  X,
  Plus,
  Minus,
  Check,
  Globe,
  Loader2,
  Sparkles,
} from "lucide-react";

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export function parseSRTorVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let i = 0;

  const timeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return 0;
    const hours = parts.length === 3 ? parseFloat(parts[0] || "0") : 0;
    const minutes = parts.length === 3 ? parseFloat(parts[1] || "0") : parseFloat(parts[0] || "0");
    const secStr = parts.length === 3 ? (parts[2] || "0") : (parts[1] || "0");
    const secParts = secStr.replace(",", ".").split(".");
    const seconds = parseFloat(secParts[0] || "0");
    const millis = secParts[1] ? parseFloat(`0.${secParts[1]}`) : 0;
    return hours * 3600 + minutes * 60 + seconds + millis;
  };

  while (i < lines.length) {
    const line = (lines[i] || "").trim();
    if (line.includes("-->")) {
      const parts = line.split("-->");
      const startStr = (parts[0] || "").trim();
      const endStr = (parts[1] || "").trim();
      const start = timeToSeconds(startStr);
      const end = timeToSeconds(endStr);
      let text = "";
      i++;
      while (i < lines.length && (lines[i] || "").trim() !== "") {
        text += (text ? " " : "") + (lines[i] || "").trim();
        i++;
      }
      // Strip HTML/formatting tags
      const cleanText = text.replace(/<[^>]*>/g, "");
      if (cleanText) {
        cues.push({ start, end, text: cleanText });
      }
    }
    i++;
  }

  return cues;
}

interface SubtitleItem {
  id: string;
  lang: string;
  label: string;
  fileName: string;
  release: string;
  url: string;
}

interface SubtitleOverlayProps {
  currentTime: number;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onTrackChange?: (trackName: string | null) => void;
  syncOffset?: number;
  onSyncOffsetChange?: (offset: number) => void;
}

export function SubtitleOverlay({
  currentTime,
  tmdbId,
  mediaType = "movie",
  season,
  episode,
  isOpen,
  onClose,
  onTrackChange,
  syncOffset: controlledSyncOffset,
  onSyncOffsetChange,
}: SubtitleOverlayProps) {
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [activeCue, setActiveCue] = useState<string | null>(null);
  
  // Local state initialized from localStorage if available
  const [internalSyncOffset, setInternalSyncOffset] = useState<number>(() => {
    if (typeof window !== "undefined" && tmdbId) {
      const saved = localStorage.getItem(`veyra_sub_sync_${mediaType}_${tmdbId}`);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  });

  const syncOffset = controlledSyncOffset !== undefined ? controlledSyncOffset : internalSyncOffset;

  const updateSyncOffset = (nextOffset: number) => {
    const rounded = +nextOffset.toFixed(1);
    setInternalSyncOffset(rounded);
    onSyncOffsetChange?.(rounded);
    if (typeof window !== "undefined" && tmdbId) {
      localStorage.setItem(`veyra_sub_sync_${mediaType}_${tmdbId}`, String(rounded));
    }
  };

  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [color, setColor] = useState<"white" | "yellow" | "cyan">("yellow");
  const [hasBackground, setHasBackground] = useState(true);
  const [showSettingsInternal, setShowSettingsInternal] = useState(false);
  const [activeTrackName, setActiveTrackName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isModalOpen = isOpen !== undefined ? isOpen : showSettingsInternal;
  const closeModal = () => {
    setShowSettingsInternal(false);
    onClose?.();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen]);

  useEffect(() => {
    onTrackChange?.(activeTrackName);
  }, [activeTrackName, onTrackChange]);

  // Auto-scraped subtitles list
  const [availableSubs, setAvailableSubs] = useState<SubtitleItem[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available subtitles automatically on mount / change
  useEffect(() => {
    if (!tmdbId) return;

    let isMounted = true;
    setLoadingSubs(true);

    const params = new URLSearchParams({
      tmdbId: String(tmdbId),
      mediaType,
      ...(season ? { season: String(season) } : {}),
      ...(episode ? { episode: String(episode) } : {}),
    });

    fetch(`/api/subtitles?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const subs: SubtitleItem[] = data.subtitles || [];
        setAvailableSubs(subs);
        setLoadingSubs(false);
      })
      .catch(() => {
        if (isMounted) setLoadingSubs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tmdbId, mediaType, season, episode]);

  const loadSubtitleFromUrl = async (downloadUrl: string, label: string) => {
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/subtitles/content?url=${encodeURIComponent(downloadUrl)}`);
      if (!res.ok) throw new Error("Failed to download subtitle");
      const text = await res.text();
      const parsed = parseSRTorVTT(text);
      setCues(parsed);
      setActiveTrackName(label);
    } catch (e) {
      console.error("Subtitle load error:", e);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActiveTrackName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseSRTorVTT(text);
        setCues(parsed);
      }
    };
    reader.readAsText(file);
  };

  const disableSubtitles = () => {
    setCues([]);
    setActiveTrackName(null);
  };

  // Find active cue based on currentTime + syncOffset
  useEffect(() => {
    if (cues.length === 0) {
      setActiveCue(null);
      return;
    }
    const adjustedTime = currentTime + syncOffset;
    const match = cues.find((c) => adjustedTime >= c.start && adjustedTime <= c.end);
    setActiveCue(match ? match.text : null);
  }, [currentTime, syncOffset, cues]);

  const fontSizeClass = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  }[fontSize];

  const colorClass = {
    white: "text-white",
    yellow: "text-amber-300",
    cyan: "text-cyan-300",
  }[color];

  return (
    <>
      {/* Active Subtitle Render on Screen */}
      {activeCue && (
        <div
          data-cinema-dark
          className="absolute bottom-12 left-0 right-0 z-30 flex justify-center px-6 pointer-events-none transition-all duration-75"
        >
          <span
            className={`max-w-3xl text-center font-bold tracking-wide leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-3 py-1 rounded-md ${fontSizeClass} ${colorClass} ${
              hasBackground ? "bg-black/75 backdrop-blur-sm" : ""
            }`}
          >
            {activeCue}
          </span>
        </div>
      )}

      {/* Subtitle Settings & Automated Picker Drawer */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div
            data-cinema-dark
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={closeModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900/95 p-5 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Subtitles size={18} className="text-accent" />
                <span className="font-bold text-sm">Subtitles & Audio Timing</span>
              </div>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Subtitles List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                  <Globe size={13} className="text-accent" />
                  Choose Subtitle Language
                </span>
                {loadingSubs && (
                  <span className="text-[11px] text-accent flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin" /> Finding...
                  </span>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 rounded-xl bg-black/40 border border-white/10 p-2">
                {loadingSubs ? (
                  <div className="py-6 text-center text-xs text-white/50 flex flex-col items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-accent" />
                    Finding available subtitles...
                  </div>
                ) : availableSubs.length > 0 ? (
                  availableSubs.slice(0, 15).map((sub) => {
                    const isSelected = activeTrackName === sub.label;
                    return (
                      <button
                        key={sub.id}
                        disabled={loadingContent}
                        onClick={() => loadSubtitleFromUrl(sub.url, sub.label)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition text-left ${
                          isSelected
                            ? "bg-accent text-[var(--on-accent)] font-bold shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-white/90"
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        {isSelected && <Check size={13} className="shrink-0 ml-1" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-3 text-center text-xs text-white/50">
                    No subtitles found for this title.
                  </div>
                )}
              </div>

              {activeTrackName && (
                <button
                  onClick={disableSubtitles}
                  className="w-full text-center py-1 text-xs text-red-400 hover:text-red-300 transition"
                >
                  Turn Off Subtitles
                </button>
              )}
            </div>

            {/* Sync Offset Controls */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80">Audio & Subtitle Timing Sync</span>
                <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  {syncOffset === 0 ? "In Sync (0.0s)" : `${syncOffset > 0 ? "+" : ""}${syncOffset.toFixed(1)}s`}
                </span>
              </div>

              {/* Range slider for smooth scrubbing */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-white/50 font-mono">-10s</span>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={syncOffset}
                  onChange={(e) => updateSyncOffset(parseFloat(e.target.value) || 0)}
                  className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <span className="text-[10px] text-white/50 font-mono">+10s</span>
              </div>

              {/* Granular Preset Nudge Buttons */}
              <div className="flex items-center justify-between gap-1 bg-black/40 rounded-xl p-1.5 border border-white/10">
                <button
                  onClick={() => updateSyncOffset(syncOffset - 1.0)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] font-mono transition text-white/80 hover:text-white"
                  title="Delay subtitles 1 second"
                >
                  -1.0s
                </button>
                <button
                  onClick={() => updateSyncOffset(syncOffset - 0.5)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] font-mono transition text-white/80 hover:text-white"
                  title="Delay subtitles 0.5 seconds"
                >
                  -0.5s
                </button>
                <button
                  onClick={() => updateSyncOffset(syncOffset - 0.1)}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold transition text-white"
                  title="Delay subtitles 0.1 seconds"
                >
                  -0.1s
                </button>

                <button
                  onClick={() => updateSyncOffset(0)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                    syncOffset === 0
                      ? "bg-white/20 text-white cursor-default"
                      : "bg-accent/20 text-accent hover:bg-accent/30"
                  }`}
                  title="Reset offset to zero"
                >
                  Reset
                </button>

                <button
                  onClick={() => updateSyncOffset(syncOffset + 0.1)}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold transition text-white"
                  title="Advance subtitles 0.1 seconds"
                >
                  +0.1s
                </button>
                <button
                  onClick={() => updateSyncOffset(syncOffset + 0.5)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] font-mono transition text-white/80 hover:text-white"
                  title="Advance subtitles 0.5 seconds"
                >
                  +0.5s
                </button>
                <button
                  onClick={() => updateSyncOffset(syncOffset + 1.0)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] font-mono transition text-white/80 hover:text-white"
                  title="Advance subtitles 1 second"
                >
                  +1.0s
                </button>
              </div>

              <p className="text-[10px] text-white/40 text-center">
                Live shortcut: press <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-accent">[</kbd> or <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-accent">]</kbd> to nudge timing during playback
              </p>
            </div>

            {/* Custom file upload fallback */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-white/50">
              <span>Have your own file?</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <Upload size={12} /> Upload .SRT
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
