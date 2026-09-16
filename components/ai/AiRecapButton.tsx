"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { AiRecapModal } from "./AiRecapModal";
import { buttonVariants } from "@/components/ui/Button";

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

  const size = variant === "compact" ? "xs" : variant === "pill" ? "md" : "sm";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={buttonVariants({ variant: "outline", size })}
        title="Catch up on previous events spoiler-free"
      >
        <History size={variant === "compact" ? 11 : 13} />
        <span>{variant === "compact" ? "Recap" : "Previously On..."}</span>
      </button>

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
