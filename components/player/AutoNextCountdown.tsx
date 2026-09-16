"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Play, X, Zap, Film } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

interface AutoNextCountdownProps {
  show: boolean;
  nextHref: string;
  nextEpisodeName: string;
  nextSeasonNumber: number;
  nextEpisodeNumber: number;
  nextEpisodeStill?: string | null;
  onDismiss: () => void;
}

export function AutoNextCountdown({
  show,
  nextHref,
  nextEpisodeName,
  nextSeasonNumber,
  nextEpisodeNumber,
  nextEpisodeStill,
  onDismiss,
}: AutoNextCountdownProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isBingeMode, setIsBingeMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("veyra_binge_mode") === "true";
    }
    return false;
  });

  const toggleBingeMode = (checked: boolean) => {
    setIsBingeMode(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("veyra_binge_mode", String(checked));
    }
  };

  useEffect(() => {
    if (!show) {
      setSecondsLeft(10);
      return;
    }

    // If binge mode is active, count down faster (3 seconds)
    const initialSeconds = isBingeMode ? 3 : 10;
    setSecondsLeft(initialSeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(nextHref);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, isBingeMode, nextHref, router]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-white/20 bg-surface/95 p-4 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
            <Play size={12} fill="currentColor" />
            <span>Up Next in {secondsLeft}s</span>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative h-18 w-28 shrink-0 overflow-hidden rounded-xl bg-surface2 border border-white/10">
            {nextEpisodeStill ? (
              <Image
                src={nextEpisodeStill}
                alt={nextEpisodeName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
                <Film size={20} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-muted uppercase">
              Season {nextSeasonNumber} • Episode {nextEpisodeNumber}
            </span>
            <h4 className="font-semibold text-sm text-white truncate leading-tight mt-0.5">
              {nextEpisodeName}
            </h4>

            {/* Countdown progress line */}
            <div className="mt-2 h-1 w-full rounded-full bg-white/15 overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: isBingeMode ? 3 : 10, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-1">
          <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer hover:text-white transition">
            <Zap size={12} className={isBingeMode ? "text-accent" : "text-muted"} />
            <span>Binge Mode (Auto-Play)</span>
            <input
              type="checkbox"
              checked={isBingeMode}
              onChange={(e) => toggleBingeMode(e.target.checked)}
              className="rounded accent-accent ml-1 cursor-pointer"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Cancel
            </button>
            <button
              onClick={() => router.push(nextHref)}
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              <Play size={12} fill="currentColor" />
              Play Now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
