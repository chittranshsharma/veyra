"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { AiRecapModal } from "./AiRecapModal";

interface AiRecapButtonProps {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeName?: string;
  episodeOverview?: string;
  variant?: "pill" | "player" | "compact";
}

export function AiRecapButton({
  showName,
  seasonNumber,
  episodeNumber,
  episodeName = "",
  episodeOverview = "",
  variant = "player",
}: AiRecapButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "player" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent backdrop-blur transition hover:bg-accent/25 active:scale-95"
          title="Catch up on previous events spoiler-free"
        >
          <History size={13} />
          <span>Previously On...</span>
        </button>
      ) : variant === "pill" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-bold text-accent backdrop-blur transition hover:bg-accent/20 active:scale-95"
        >
          <History size={14} />
          <span>Previously On...</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent transition hover:bg-accent/20"
        >
          <History size={11} />
          <span>Recap</span>
        </button>
      )}

      <AiRecapModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        showName={showName}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        episodeName={episodeName}
        episodeOverview={episodeOverview}
      />
    </>
  );
}
