"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { buttonVariants } from "@/components/ui/Button";
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Server,
  HelpCircle,
  X,
  Keyboard,
} from "lucide-react";

export type HUDAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "seek_forward"; seconds: number }
  | { type: "seek_backward"; seconds: number }
  | { type: "fullscreen"; isFullscreen: boolean }
  | { type: "mute"; isMuted: boolean }
  | { type: "server"; serverName: string }
  | { type: "sub_sync"; offset: number };

interface PlayerHUDProps {
  currentAction: HUDAction | null;
  showHelp: boolean;
  onCloseHelp: () => void;
  onOpenHelp?: () => void;
  onToggleFullscreen?: () => void;
  onToggleMute?: () => void;
  onToggleSubtitles?: () => void;
  onCycleServer?: () => void;
}

export function PlayerHUD({
  currentAction,
  showHelp,
  onCloseHelp,
  onOpenHelp,
  onToggleFullscreen,
  onToggleMute,
  onToggleSubtitles,
  onCycleServer,
}: PlayerHUDProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      {/* Toast Notification Pill with Shortcut Badge */}
      <AnimatePresence>
        {currentAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-white/20 bg-black/85 px-4 py-2 text-sm font-semibold text-white shadow-2xl backdrop-blur-md select-none"
          >
            {currentAction.type === "play" && (
              <>
                <Play size={16} fill="currentColor" className="text-accent" />
                <span>Play</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">Space</kbd>
              </>
            )}
            {currentAction.type === "pause" && (
              <>
                <Pause size={16} fill="currentColor" className="text-accent" />
                <span>Pause</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">Space</kbd>
              </>
            )}
            {currentAction.type === "seek_forward" && (
              <>
                <RotateCw size={16} className="text-accent" />
                <span>+{currentAction.seconds}s</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">→</kbd>
              </>
            )}
            {currentAction.type === "seek_backward" && (
              <>
                <RotateCcw size={16} className="text-accent" />
                <span>-{currentAction.seconds}s</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">←</kbd>
              </>
            )}
            {currentAction.type === "fullscreen" && (
              <>
                {currentAction.isFullscreen ? (
                  <Minimize size={16} className="text-accent" />
                ) : (
                  <Maximize size={16} className="text-accent" />
                )}
                <span>{currentAction.isFullscreen ? "Fullscreen" : "Exit Fullscreen"}</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">F</kbd>
              </>
            )}
            {currentAction.type === "mute" && (
              <>
                {currentAction.isMuted ? (
                  <VolumeX size={16} className="text-red-400" />
                ) : (
                  <Volume2 size={16} className="text-accent" />
                )}
                <span>{currentAction.isMuted ? "Muted" : "Unmuted"}</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">M</kbd>
              </>
            )}
            {currentAction.type === "server" && (
              <>
                <Server size={16} className="text-accent" />
                <span>Server: {currentAction.serverName}</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">S</kbd>
              </>
            )}
            {currentAction.type === "sub_sync" && (
              <>
                <span className="font-mono text-accent text-xs">CC Sync</span>
                <span>{currentAction.offset === 0 ? "0.0s" : `${currentAction.offset > 0 ? "+" : ""}${currentAction.offset.toFixed(1)}s`}</span>
                <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">[ / ]</kbd>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Shortcut Tooltips HUD Bar (Visible on player hover on desktop only) */}
      <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto absolute bottom-3 right-3 z-30 items-center gap-1.5 rounded-xl border border-white/10 bg-black/75 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md shadow-lg select-none">
        {onToggleSubtitles && (
          <div className="group/item relative flex items-center">
            <button
              onClick={onToggleSubtitles}
              className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition text-[11px]"
              aria-label="Subtitles & Sync"
            >
              <span>CC</span>
              <kbd className="rounded bg-white/15 px-1 py-0.2 font-mono text-[9px] text-accent">C</kbd>
            </button>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap rounded bg-black/90 px-2 py-0.5 text-[10px] text-white border border-white/15 shadow">
              Subtitles & Sync (C)
            </div>
          </div>
        )}

        {onCycleServer && (
          <div className="group/item relative flex items-center">
            <button
              onClick={onCycleServer}
              className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition text-[11px]"
              aria-label="Cycle Server"
            >
              <Server size={12} className="text-accent" />
              <kbd className="rounded bg-white/15 px-1 py-0.2 font-mono text-[9px] text-accent">S</kbd>
            </button>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap rounded bg-black/90 px-2 py-0.5 text-[10px] text-white border border-white/15 shadow">
              Cycle Server (S)
            </div>
          </div>
        )}

        {onToggleMute && (
          <div className="group/item relative flex items-center">
            <button
              onClick={onToggleMute}
              className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition text-[11px]"
              aria-label="Toggle Mute"
            >
              <Volume2 size={12} />
              <kbd className="rounded bg-white/15 px-1 py-0.2 font-mono text-[9px] text-accent">M</kbd>
            </button>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap rounded bg-black/90 px-2 py-0.5 text-[10px] text-white border border-white/15 shadow">
              Mute / Unmute (M)
            </div>
          </div>
        )}

        {onToggleFullscreen && (
          <div className="group/item relative flex items-center">
            <button
              onClick={onToggleFullscreen}
              className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition text-[11px]"
              aria-label="Toggle Fullscreen"
            >
              <Maximize size={12} />
              <kbd className="rounded bg-white/15 px-1 py-0.2 font-mono text-[9px] text-accent">F</kbd>
            </button>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap rounded bg-black/90 px-2 py-0.5 text-[10px] text-white border border-white/15 shadow">
              Fullscreen (F)
            </div>
          </div>
        )}

        {onOpenHelp && (
          <div className="group/item relative flex items-center">
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition text-[11px]"
              aria-label="View Shortcuts"
            >
              <HelpCircle size={12} className="text-white/60" />
              <kbd className="rounded bg-white/15 px-1 py-0.2 font-mono text-[9px] text-accent">?</kbd>
            </button>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap rounded bg-black/90 px-2 py-0.5 text-[10px] text-white border border-white/15 shadow">
              All Shortcuts (?)
            </div>
          </div>
        )}
      </div>

      {/* Hotkey Cheat Sheet Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showHelp && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                onClick={onCloseHelp}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                  <button
                    onClick={onCloseHelp}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
                  <Keyboard size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Cinema Keyboard Shortcuts</h3>
                  <p className="text-xs text-muted">Control your playback without touching the mouse</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                {[
                  { key: "Space", label: "Play / Pause" },
                  { key: "← / →", label: "Skip -10s / +10s" },
                  { key: "F", label: "Toggle Fullscreen" },
                  { key: "M", label: "Mute / Unmute" },
                  { key: "S", label: "Cycle Stream Servers" },
                  { key: "N", label: "Next Episode (TV)" },
                  { key: "C", label: "Subtitles & Timing Modal" },
                  { key: "[ / ]", label: "Nudge Subtitle Sync (-0.1s / +0.1s)" },
                  { key: "X", label: "Movie Trivia & Facts" },
                  { key: "?", label: "Open / Close Shortcuts" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl bg-surface2/60 px-3.5 py-2 border border-white/5"
                  >
                    <span className="text-muted text-xs">{label}</span>
                    <kbd className="rounded-lg bg-black/60 border border-white/15 px-2.5 py-1 font-mono text-xs font-semibold text-accent shadow-inner">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>

              <button
                onClick={onCloseHelp}
                className={buttonVariants({ variant: "primary", size: "md", className: "mt-5 w-full" })}
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
