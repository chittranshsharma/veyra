"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AiXRayDrawer } from "./AiXRayDrawer";

interface AiXRayButtonProps {
  title: string;
  mediaType?: "movie" | "tv";
  overview?: string;
  genres?: string[];
  cast?: string[];
  variant?: "pill" | "compact" | "player";
}

export function AiXRayButton({
  title,
  mediaType = "movie",
  overview = "",
  genres = [],
  cast = [],
  variant = "pill",
}: AiXRayButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "pill" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-300 backdrop-blur-md transition hover:border-purple-500/60 hover:bg-purple-500/20 active:scale-95 shadow-sm"
          title="Open AI X-Ray Intelligence"
        >
          <Sparkles size={16} className="text-purple-400 animate-pulse" />
          <span>AI X-Ray</span>
        </button>
      ) : variant === "player" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur transition hover:bg-purple-500/25 active:scale-95"
          title="Open AI X-Ray Scene Intelligence"
        >
          <Sparkles size={13} className="text-purple-400" />
          <span>AI X-Ray</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
        >
          <Sparkles size={13} className="text-purple-400" />
          <span>X-Ray</span>
        </button>
      )}

      <AiXRayDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        mediaType={mediaType}
        overview={overview}
        genres={genres}
        cast={cast}
      />
    </>
  );
}
