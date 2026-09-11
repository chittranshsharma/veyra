"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, X, Sparkles, ShieldCheck, Users, HelpCircle, Zap } from "lucide-react";

interface AiRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeName?: string;
  episodeOverview?: string;
}

interface RecapData {
  storySoFar: string[];
  characterRadar: string[];
  activeMysteries: string[];
}

export function AiRecapModal({
  isOpen,
  onClose,
  showName,
  seasonNumber,
  episodeNumber,
  episodeName = "",
  episodeOverview = "",
}: AiRecapModalProps) {
  const [loading, setLoading] = useState(false);
  const [recapData, setRecapData] = useState<RecapData | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRecap = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/recap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showName,
            seasonNumber,
            episodeNumber,
            episodeName,
            episodeOverview,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setRecapData({
            storySoFar: data.storySoFar ?? [],
            characterRadar: data.characterRadar ?? [],
            activeMysteries: data.activeMysteries ?? [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch episode recap:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecap();
  }, [isOpen, showName, seasonNumber, episodeNumber, episodeName, episodeOverview]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/98 shadow-2xl shadow-black/80 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-emerald-400 text-background shadow-lg shadow-accent/25">
                  <History size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white">
                      Previously On...
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30">
                      <Zap size={10} fill="currentColor" />
                      Groq
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {showName} — S{seasonNumber}E{episodeNumber} {episodeName && `• "${episodeName}"`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-muted transition hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Subheader Banner: Zero-Spoiler Guarantee */}
            <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck size={14} />
              <span>Strictly Spoiler-Free: Recaps events prior to this episode only.</span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading && (
                <div className="space-y-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent border border-accent/30 animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    Groq is synthesizing the story so far...
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="skeleton h-24 rounded-2xl" />
                    <div className="skeleton h-20 rounded-2xl" />
                    <div className="skeleton h-20 rounded-2xl" />
                  </div>
                </div>
              )}

              {!loading && recapData && (
                <>
                  {/* The Story So Far */}
                  <div className="space-y-2.5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <History size={13} />
                      The Story So Far
                    </h3>
                    <div className="space-y-2">
                      {recapData.storySoFar.map((point, i) => (
                        <div
                          key={i}
                          className="flex gap-2.5 rounded-xl border border-white/5 bg-surface2/50 p-3 text-xs leading-relaxed text-white/90"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                            {i + 1}
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Character & Alliance Radar */}
                  {recapData.characterRadar.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                        <Users size={13} />
                        Character & Alliance Radar
                      </h3>
                      <div className="space-y-2">
                        {recapData.characterRadar.map((point, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-purple-500/15 bg-purple-500/5 p-3 text-xs leading-relaxed text-white/90"
                          >
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Mysteries */}
                  {recapData.activeMysteries.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                        <HelpCircle size={13} />
                        Active Mysteries on the Table
                      </h3>
                      <div className="space-y-2">
                        {recapData.activeMysteries.map((point, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-xs leading-relaxed text-white/90"
                          >
                            ❓ {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-3 bg-surface2/30 flex justify-end">
              <button
                onClick={onClose}
                className="btn-shimmer rounded-xl bg-accent px-5 py-2 text-xs font-bold text-background transition hover:brightness-110"
              >
                Ready to Watch
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
