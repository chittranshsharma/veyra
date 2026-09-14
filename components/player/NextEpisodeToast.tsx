"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Play, X } from "lucide-react";

interface NextEpisodeToastProps {
  nextHref: string;
  nextEpisodeName: string;
  nextEpisodeNumber: number;
  nextSeasonNumber: number;
  nextEpisodeStill?: string | null;
  onCancel: () => void;
}

const COUNTDOWN_SECONDS = 12;

export function NextEpisodeToast({
  nextHref,
  nextEpisodeName,
  nextEpisodeNumber,
  nextSeasonNumber,
  nextEpisodeStill,
  onCancel,
}: NextEpisodeToastProps) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const router = useRouter();

  useEffect(() => {
    if (remaining <= 0) {
      router.push(nextHref);
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, nextHref, router]);

  // SVG ring parameters
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / COUNTDOWN_SECONDS;
  const dashOffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="pointer-events-auto flex w-80 overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/70 ring-1 ring-white/10"
      >
        {/* Thumbnail */}
        {nextEpisodeStill && (
          <div className="relative h-24 w-32 shrink-0">
            <Image
              src={nextEpisodeStill}
              alt={nextEpisodeName}
              fill
              sizes="128px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between gap-2 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              Up Next
            </p>
            <p className="text-xs text-muted">
              S{String(nextSeasonNumber).padStart(2, "0")}E{String(nextEpisodeNumber).padStart(2, "0")}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white leading-tight">
              {nextEpisodeName}
            </p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(nextHref)}
              className="btn-shimmer flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-1.5 text-xs font-semibold text-background transition hover:brightness-110"
            >
              <Play size={12} fill="currentColor" />
              Play Now
            </button>
            <button
              onClick={onCancel}
              className="rounded-lg bg-surface2 p-1.5 text-muted transition hover:text-white"
              aria-label="Cancel"
            >
              <X size={14} />
            </button>

            {/* Countdown ring */}
            <svg width="44" height="44" className="shrink-0 -rotate-90">
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="#00e5c7"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
              <text
                x="22"
                y="22"
                textAnchor="middle"
                dominantBaseline="central"
                className="rotate-90"
                fill="white"
                fontSize="11"
                fontWeight="700"
                transform="rotate(90, 22, 22)"
              >
                {remaining}
              </text>
            </svg>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
