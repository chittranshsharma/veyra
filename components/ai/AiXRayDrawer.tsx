"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Lightbulb,
  Brain,
  Clapperboard,
  MessageSquare,
  X,
  Eye,
  EyeOff,
  Send,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Film,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

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

interface TabItem {
  id: Mode;
  label: string;
  shortLabel: string;
  icon: typeof Lightbulb;
}

const TABS: TabItem[] = [
  { id: "trivia", label: "Fun Facts", shortLabel: "Facts", icon: Lightbulb },
  { id: "clarify", label: "Explain Plot", shortLabel: "Plot", icon: Brain },
  { id: "ending", label: "Ending", shortLabel: "Ending", icon: Clapperboard },
  { id: "question", label: "Ask AI", shortLabel: "Ask", icon: MessageSquare },
];

/**
 * Parses markdown bolding (**bold text**) and renders it cleanly as styled React elements
 */
function FormattedParagraph({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <strong key={i} className="font-semibold text-text-primary">
              {inner}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
}

/**
 * Renders multiple paragraphs or bullet points cleanly without raw markdown tags
 */
function FormattedMarkdown({ content }: { content: string }) {
  const lines = content.split(/\n+/).filter((l) => l.trim().length > 0);
  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const clean = line.replace(/^[\*\-\•]\s*/, "");
        return <FormattedParagraph key={idx} text={clean} />;
      })}
    </div>
  );
}

/**
 * Parses a trivia line like `* **Topic**: Detail text...` into structured components
 */
function parseTriviaItem(raw: string, index: number) {
  const cleaned = raw.replace(/^[\*\-\•]\s*/, "").trim();
  if (!cleaned) return null;

  // Pattern: **Topic**: Description or **Topic** - Description
  const boldMatch = cleaned.match(/^\*\*([^*]+)\*\*[:\s\-—]+([\s\S]+)$/);
  if (boldMatch && boldMatch[1] && boldMatch[2]) {
    return {
      index,
      topic: boldMatch[1].trim(),
      description: boldMatch[2].trim(),
    };
  }

  // Pattern: Topic: Description (e.g. Director's Vision: ...)
  const colonMatch = cleaned.match(/^([A-Z][A-Za-z0-9\s&'/—–-]{2,32})[:\-—]\s+([\s\S]+)$/);
  if (colonMatch && colonMatch[1] && colonMatch[2]) {
    return {
      index,
      topic: colonMatch[1].trim(),
      description: colonMatch[2].trim(),
    };
  }

  // General text fallback (strip any leftover **)
  return {
    index,
    topic: null,
    description: cleaned.replace(/\*\*/g, ""),
  };
}

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
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async (mode: Mode, customQuestion?: string) => {
    if (contentCache[mode] && mode !== "question") return;

    setLoading(true);
    setError(null);
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
      } else {
        setError(data.error || "Unable to fetch insights at this moment.");
      }
    } catch (err) {
      console.error("Failed to fetch X-Ray data:", err);
      setError("Connection error. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Mode) => {
    setActiveTab(tab);
    setError(null);
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

  const handlePresetQuestion = (presetText: string) => {
    setQuestionInput(presetText);
    fetchContent("question", presetText);
  };

  // Parse trivia bullet points
  const triviaLines = contentCache.trivia
    ? contentCache.trivia.split("\n").filter((l) => l.trim().length > 0)
    : [];

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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer Container with theme-aware solid background */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{ backgroundColor: "var(--bg-surface)" }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border shadow-2xl shadow-black/80 backdrop-blur-2xl sm:max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-[var(--on-accent)] shadow-md shadow-accent/25">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-text-primary">
                      Movie Trivia & Insights
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/25">
                      <Sparkles size={10} fill="currentColor" />
                      AI Powered
                    </span>
                  </div>
                  <p className="truncate text-xs font-medium text-text-secondary max-w-[240px] sm:max-w-[280px]">
                    {title}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{ backgroundColor: "var(--bg-surface2)" }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:text-text-primary hover:border-border-hover"
                aria-label="Close insights drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{ backgroundColor: "var(--bg-surface2)" }}
              className="grid grid-cols-4 gap-1 border-b border-border p-1.5 text-xs font-semibold"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2 px-1 text-center transition-all ${
                      isActive
                        ? "bg-accent text-[var(--on-accent)] font-bold shadow-md shadow-accent/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Error Notice */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                    <button
                      onClick={() => fetchContent(activeTab)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      <RefreshCw size={11} /> Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent border border-accent/30 animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    Analyzing movie secrets & details...
                  </div>
                  <div className="space-y-3 pt-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{ backgroundColor: "var(--bg-surface2)" }}
                        className="h-24 rounded-2xl border border-border animate-pulse p-4 space-y-2"
                      >
                        <div className="h-4 w-28 rounded-md bg-border/60" />
                        <div className="h-3 w-full rounded bg-border/40" />
                        <div className="h-3 w-4/5 rounded bg-border/40" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: FUN FACTS */}
              {!loading && activeTab === "trivia" && (
                <div className="space-y-3.5">
                  {/* Banner */}
                  <div className="flex items-center gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-xs text-text-primary">
                    <Lightbulb size={16} className="text-accent shrink-0" />
                    <div>
                      <span className="font-bold text-accent">Production Secrets & Easter Eggs</span>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Verified behind-the-scenes facts and hidden cinematic details.
                      </p>
                    </div>
                  </div>

                  {/* Fact Cards */}
                  <div className="space-y-3">
                    {triviaLines.map((line, idx) => {
                      const item = parseTriviaItem(line, idx + 1);
                      if (!item) return null;

                      return (
                        <div
                          key={idx}
                          style={{ backgroundColor: "var(--bg-surface2)" }}
                          className="group relative rounded-2xl border border-border p-4 transition-all hover:border-accent/40 hover:shadow-md"
                        >
                          {/* Header pill / Topic */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/25">
                                Fact {String(idx + 1).padStart(2, "0")}
                              </span>
                              {item.topic && (
                                <h4 className="font-display text-xs font-bold text-text-primary tracking-wide">
                                  {item.topic}
                                </h4>
                              )}
                            </div>
                            <Sparkles
                              size={13}
                              className="text-accent/40 group-hover:text-accent transition-colors"
                            />
                          </div>

                          {/* Fact description */}
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: EXPLAIN PLOT (SPOILER-FREE) */}
              {!loading && activeTab === "clarify" && (
                <div className="space-y-3.5">
                  {/* Banner */}
                  <div className="flex items-start gap-2.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-text-primary">
                    <Brain size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-400">Spoiler-Free Plot Guide</span>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Clarifying the narrative setup, world rules, and character stakes without spoiling any twists.
                      </p>
                    </div>
                  </div>

                  {/* Content card */}
                  {contentCache.clarify ? (
                    <div
                      style={{ backgroundColor: "var(--bg-surface2)" }}
                      className="rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-3"
                    >
                      <FormattedMarkdown content={contentCache.clarify} />
                    </div>
                  ) : null}
                </div>
              )}

              {/* TAB 3: ENDING (WITH SPOILER SHIELD) */}
              {!loading && activeTab === "ending" && (
                <div className="space-y-3.5">
                  {!showEndingSpoiler ? (
                    <div
                      style={{ backgroundColor: "var(--bg-surface2)" }}
                      className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 p-6 sm:p-8 text-center space-y-4 shadow-sm"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 shadow-inner">
                        <EyeOff size={26} />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="font-display text-base font-bold text-text-primary">
                          Ending Spoiler Protection
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          This section deconstructs the climax, thematic metaphors, and resolution of{" "}
                          <span className="font-semibold text-text-primary">{title}</span>.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowEndingSpoiler(true);
                          if (!contentCache.ending) fetchContent("ending");
                        }}
                        className={buttonVariants({
                          variant: "primary",
                          size: "md",
                          className:
                            "!bg-amber-500 !border-amber-500/80 !text-black hover:!brightness-[1.05] font-bold shadow-md shadow-amber-500/20",
                        })}
                      >
                        <Eye size={15} />
                        Reveal Ending Breakdown
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Warning banner */}
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-text-primary">
                        <div className="flex items-center gap-2">
                          <Eye size={15} className="text-amber-400 shrink-0" />
                          <span className="font-bold text-amber-400">
                            Spoiler Mode Active: Ending Breakdown
                          </span>
                        </div>
                        <button
                          onClick={() => setShowEndingSpoiler(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary"
                        >
                          <EyeOff size={12} /> Hide
                        </button>
                      </div>

                      {/* Content card */}
                      {contentCache.ending ? (
                        <div
                          style={{ backgroundColor: "var(--bg-surface2)" }}
                          className="rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-3"
                        >
                          <FormattedMarkdown content={contentCache.ending} />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ASK AI */}
              {!loading && activeTab === "question" && (
                <div className="space-y-4">
                  {/* Question input */}
                  <form onSubmit={handleAskQuestion} className="relative">
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder={`Ask anything about ${title}...`}
                      style={{ backgroundColor: "var(--bg-surface2)" }}
                      className="w-full rounded-2xl border border-border py-3 pl-4 pr-12 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={loading || !questionInput.trim()}
                      className={buttonVariants({
                        variant: "primary",
                        size: "icon-sm",
                        className:
                          "absolute right-1.5 top-1/2 -translate-y-1/2 disabled:opacity-40",
                      })}
                      aria-label="Submit question"
                    >
                      <Send size={13} />
                    </button>
                  </form>

                  {/* AI Answer Card */}
                  {questionAnswer && (
                    <div
                      style={{ backgroundColor: "var(--bg-surface2)" }}
                      className="rounded-2xl border border-accent/30 p-4 sm:p-5 shadow-md space-y-2.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <Sparkles size={14} />
                        <span>AI Answer</span>
                      </div>
                      <FormattedMarkdown content={questionAnswer} />
                    </div>
                  )}

                  {/* Preset Questions Suggestions */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                      <HelpCircle size={12} />
                      <span>Popular Questions to Ask:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        "What is the deeper meaning of this movie?",
                        "What was the most challenging scene to film?",
                        "What inspired the director to create this story?",
                        "What are the subtle easter eggs most people miss?",
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handlePresetQuestion(preset)}
                          style={{ backgroundColor: "var(--bg-surface2)" }}
                          className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5 text-left text-xs text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
                        >
                          <span>&ldquo;{preset}&rdquo;</span>
                          <Send size={11} className="shrink-0 text-muted ml-2 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
