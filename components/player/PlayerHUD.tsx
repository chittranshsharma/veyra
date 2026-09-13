"use client";

import { motion, AnimatePresence } from "motion/react";
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
  | { type: "server"; serverName: string };

interface PlayerHUDProps {
  currentAction: HUDAction | null;
  showHelp: boolean;
  onCloseHelp: () => void;
}

export function PlayerHUD({ currentAction, showHelp, onCloseHelp }: PlayerHUDProps) {
  return (
    <>
      {/* Toast Notification Pill */}
      <AnimatePresence>
        {currentAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-2xl backdrop-blur-md"
          >
            {currentAction.type === "play" && (
              <>
                <Play size={16} fill="currentColor" className="text-accent" />
                <span>Play</span>
              </>
            )}
            {currentAction.type === "pause" && (
              <>
                <Pause size={16} fill="currentColor" className="text-accent" />
                <span>Pause</span>
              </>
            )}
            {currentAction.type === "seek_forward" && (
              <>
                <RotateCw size={16} className="text-accent" />
                <span>+{currentAction.seconds}s</span>
              </>
            )}
            {currentAction.type === "seek_backward" && (
              <>
                <RotateCcw size={16} className="text-accent" />
                <span>-{currentAction.seconds}s</span>
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
              </>
            )}
            {currentAction.type === "server" && (
              <>
                <Server size={16} className="text-accent" />
                <span>Server: {currentAction.serverName}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotkey Cheat Sheet Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl"
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
                  { key: "X", label: "Toggle AI X-Ray" },
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
                className="mt-5 w-full rounded-xl bg-accent py-2.5 text-xs font-semibold text-background hover:brightness-110 transition"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
