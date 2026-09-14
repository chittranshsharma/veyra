"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Subtitles, Upload, Settings2, X, Plus, Minus, Check } from "lucide-react";

export interface SubtitleCue {
  id: number;
  start: number;
  end: number;
  text: string;
}

function parseTime(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().replace(",", ".").split(":");
  if (parts.length === 3) {
    return parseFloat(parts[0] || "0") * 3600 + parseFloat(parts[1] || "0") * 60 + parseFloat(parts[2] || "0");
  } else if (parts.length === 2) {
    return parseFloat(parts[0] || "0") * 60 + parseFloat(parts[1] || "0");
  }
  return parseFloat(timeStr) || 0;
}

export function parseSRTorVTT(content: string): SubtitleCue[] {
  const clean = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = clean.split(/\n\n+/);
  const cues: SubtitleCue[] = [];
  let id = 1;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1 || !lines[timeLineIdx]) continue;

    const timeLine = lines[timeLineIdx]!;
    const parts = timeLine.split("-->");
    const startStr = parts[0]?.trim().split(" ")[0];
    const endStr = parts[1]?.trim().split(" ")[0];
    if (!startStr || !endStr) continue;

    const start = parseTime(startStr);
    const end = parseTime(endStr);
    const text = lines.slice(timeLineIdx + 1).join(" ").replace(/<[^>]+>/g, "").trim();

    if (text && !isNaN(start) && !isNaN(end)) {
      cues.push({ id: id++, start, end, text });
    }
  }

  return cues;
}

interface SubtitleOverlayProps {
  currentTime: number;
}

export function SubtitleOverlay({ currentTime }: SubtitleOverlayProps) {
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [activeCue, setActiveCue] = useState<string | null>(null);
  const [syncOffset, setSyncOffset] = useState<number>(0);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [color, setColor] = useState<"white" | "yellow" | "cyan">("yellow");
  const [hasBackground, setHasBackground] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
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
    yellow: "text-[#ffe600]",
    cyan: "text-[#00e5ff]",
  }[color];

  return (
    <>
      {/* Active Subtitle Render on Screen */}
      {activeCue && (
        <div className="pointer-events-none absolute bottom-12 left-0 right-0 z-30 flex justify-center px-6">
          <p
            className={`text-center font-medium leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all ${fontSizeClass} ${colorClass} ${
              hasBackground ? "rounded-lg bg-black/75 px-3.5 py-1.5 backdrop-blur-[2px]" : ""
            }`}
          >
            {activeCue}
          </p>
        </div>
      )}

      {/* Subtitle Controls Button (Floating overlay in player) */}
      <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowSettings((v) => !v)}
          title="External Subtitles & Sync"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
            cues.length > 0
              ? "border-accent/40 bg-black/70 text-accent"
              : "border-white/10 bg-black/60 text-muted hover:text-white"
          }`}
        >
          <Subtitles size={14} />
          <span>{fileName ? "Subs (Active)" : "Subtitles"}</span>
        </button>
      </div>

      {/* Subtitle Settings & Upload Drawer / Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-4 top-14 z-50 w-72 rounded-2xl border border-white/15 bg-surface/95 p-4 text-xs shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Settings2 size={14} className="text-accent" />
                <span>Subtitle Settings</span>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1 text-muted hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-3 space-y-3.5">
              {/* File Upload / Remove */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".srt,.vtt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {fileName ? (
                  <div className="flex items-center justify-between rounded-xl bg-surface2/70 p-2 border border-white/10">
                    <span className="truncate text-white max-w-[170px]">{fileName}</span>
                    <button
                      onClick={() => {
                        setCues([]);
                        setFileName(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-surface2/40 py-3 text-muted hover:border-accent hover:text-white transition"
                  >
                    <Upload size={14} />
                    <span>Drop or Load .SRT / .VTT file</span>
                  </button>
                )}
              </div>

              {/* Sync Offset Slider */}
              {cues.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-muted">
                    <span>Sync Delay</span>
                    <span className="font-mono text-accent font-semibold">
                      {syncOffset > 0 ? `+${syncOffset.toFixed(1)}s` : `${syncOffset.toFixed(1)}s`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSyncOffset((s) => Number((s - 0.5).toFixed(1)))}
                      className="rounded-lg bg-surface2 p-1 text-white hover:bg-white/20"
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={syncOffset}
                      onChange={(e) => setSyncOffset(parseFloat(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <button
                      onClick={() => setSyncOffset((s) => Number((s + 0.5).toFixed(1)))}
                      className="rounded-lg bg-surface2 p-1 text-white hover:bg-white/20"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Color & Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-muted">
                  <span>Color & Size</span>
                  <div className="flex items-center gap-1">
                    {(["white", "yellow", "cyan"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`h-4 w-4 rounded-full border ${
                          color === c ? "ring-2 ring-accent" : "border-white/20"
                        } ${
                          c === "white"
                            ? "bg-white"
                            : c === "yellow"
                            ? "bg-[#ffe600]"
                            : "bg-[#00e5ff]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {(["sm", "md", "lg", "xl"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`rounded-lg py-1 uppercase text-[10px] font-bold transition ${
                        fontSize === s
                          ? "bg-accent text-background"
                          : "bg-surface2 text-muted hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Box Toggle */}
              <label className="flex items-center justify-between text-muted cursor-pointer">
                <span>Dark Background Box</span>
                <input
                  type="checkbox"
                  checked={hasBackground}
                  onChange={(e) => setHasBackground(e.target.checked)}
                  className="rounded accent-accent"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
