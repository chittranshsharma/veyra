"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Lightbulb, Brain, Clapperboard, MessageSquare, X, Zap, Eye, Send } from "lucide-react";

interface AiXRayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaType?: "movie" | "tv";
  overview?: string;
  genres?: string[];
  cast?: string[];
}

type Mode = "trivia" | "clarify" | "ending" | "question";

export function AiXRayDrawer({
  isOpen,
  onClose,
  title,
  mediaType = "movie",
  overview = "",
  genres = [],
  cast = [],
}: AiXRayDrawerProps) {
  const [activeTab, setActiveTab] = useState<Mode>("trivia");
  const [loading, setLoading] = useState(false);
  const [contentCache, setContentCache] = useState<Partial<Record<Mode, string>>>({});
  const [showEndingSpoiler, setShowEndingSpoiler] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null);

  const fetchContent = async (mode: Mode, customQuestion?: string) => {
    if (contentCache[mode] && mode !== "question") return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          mediaType,
          overview,
          genres,
          cast,
          mode,
          question: customQuestion,
        }),
      });
      const data = await res.json();
      if (data.success && data.content) {
        if (mode === "question") {
          setQuestionAnswer(data.content);
        } else {
          setContentCache((prev) => ({ ...prev, [mode]: data.content }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch X-Ray data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Mode) => {
    setActiveTab(tab);
    if (!contentCache[tab] && tab !== "question") {
      fetchContent(tab);
    }
  };

  // Preload trivia when opened
  const handleOpenEffect = () => {
    if (!contentCache.trivia) {
      fetchContent("trivia");
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || loading) return;
    fetchContent("question", questionInput.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onAnimationStart={handleOpenEffect}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-surface/98 shadow-2xl shadow-black/80 backdrop-blur-2xl sm:max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-purple-500 text-background shadow-lg shadow-accent/25">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white">
                      AI X-Ray Intelligence
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30">
                      <Zap size={10} fill="currentColor" />
                      Groq
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted max-w-[260px]">
                    {title}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-muted transition hover:bg-white/10 hover:text-white"
                aria-label="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 border-b border-white/10 bg-surface2/40 p-1.5 text-xs font-semibold">
              <button
                onClick={() => handleTabChange("trivia")}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 transition ${
                  activeTab === "trivia"
                    ? "bg-accent text-background shadow font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                <Lightbulb size={15} />
                <span>Trivia</span>
              </button>
              <button
                onClick={() => handleTabChange("clarify")}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 transition ${
                  activeTab === "clarify"
                    ? "bg-accent text-background shadow font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                <Brain size={15} />
                <span>Clarifier</span>
              </button>
              <button
                onClick={() => handleTabChange("ending")}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 transition ${
                  activeTab === "ending"
                    ? "bg-accent text-background shadow font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                <Clapperboard size={15} />
                <span>Ending</span>
              </button>
              <button
                onClick={() => handleTabChange("question")}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 transition ${
                  activeTab === "question"
                    ? "bg-accent text-background shadow font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                <MessageSquare size={15} />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading && (
                <div className="space-y-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent border border-accent/30 animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    Analyzing cinematic knowledge with Groq...
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="skeleton h-20 rounded-xl" />
                    <div className="skeleton h-20 rounded-xl" />
                    <div className="skeleton h-20 rounded-xl" />
                  </div>
                </div>
              )}

              {/* Trivia Tab */}
              {!loading && activeTab === "trivia" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-accent">
                    💡 <strong>Production Secrets & Easter Eggs</strong> verified by AI analysis.
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none space-y-2 text-white/90 leading-relaxed">
                    {contentCache.trivia?.split("\n").map((line, idx) => {
                      if (!line.trim()) return null;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/5 bg-surface2/50 p-3.5 text-xs leading-relaxed"
                        >
                          {line.replace(/^\*\s*/, "")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plot Clarifier Tab */}
              {!loading && activeTab === "clarify" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">
                    🛡️ <strong>Spoiler-Free Guarantee</strong>: Clarifies the premise, world-building rules, and character stakes without spoiling any third-act twists.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-surface2/60 p-4 text-xs leading-relaxed text-white/90 whitespace-pre-line">
                    {contentCache.clarify}
                  </div>
                </div>
              )}

              {/* Ending Deconstructed Tab (With Spoiler Shield) */}
              {!loading && activeTab === "ending" && (
                <div className="space-y-3">
                  {!showEndingSpoiler ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                        <Eye size={24} />
                      </div>
                      <h3 className="font-display text-base font-bold text-white">
                        Ending Spoiler Protection
                      </h3>
                      <p className="text-xs text-muted max-w-xs">
                        This section breaks down the climax, symbolic metaphors, and narrative ambiguity of {title}.
                      </p>
                      <button
                        onClick={() => {
                          setShowEndingSpoiler(true);
                          if (!contentCache.ending) fetchContent("ending");
                        }}
                        className="btn-shimmer rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-background transition hover:brightness-110 shadow-lg shadow-amber-500/25"
                      >
                        Reveal Ending Deconstruction
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                        ⚠️ <strong>Spoiler Mode Active</strong>: Complete thematic breakdown of the ending.
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-surface2/60 p-4 text-xs leading-relaxed text-white/90 whitespace-pre-line">
                        {contentCache.ending}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ask Question Tab */}
              {!loading && activeTab === "question" && (
                <div className="space-y-4">
                  <form onSubmit={handleAskQuestion} className="relative">
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder={`Ask anything about ${title}...`}
                      className="w-full rounded-2xl border border-white/10 bg-surface2/80 py-3 pl-3.5 pr-12 text-xs text-white placeholder-muted focus:border-accent/60 focus:bg-surface2 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading || !questionInput.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-background transition hover:brightness-110 disabled:opacity-40"
                    >
                      <Send size={13} />
                    </button>
                  </form>

                  {questionAnswer && (
                    <div className="rounded-2xl border border-white/10 bg-surface2/60 p-4 text-xs leading-relaxed text-white/90 whitespace-pre-line">
                      {questionAnswer}
                    </div>
                  )}

                  {!questionAnswer && (
                    <div className="text-center py-6 text-xs text-muted space-y-1">
                      <p>Try asking:</p>
                      <p className="text-accent cursor-pointer hover:underline" onClick={() => setQuestionInput("What is the deeper meaning of this movie?")}>
                        &ldquo;What is the deeper meaning of this movie?&rdquo;
                      </p>
                      <p className="text-accent cursor-pointer hover:underline" onClick={() => setQuestionInput("What was the hardest scene to shoot?")}>
                        &ldquo;What was the hardest scene to shoot?&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
