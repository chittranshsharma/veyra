"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AiXRayDrawer } from "./AiXRayDrawer";
import { buttonVariants } from "@/components/ui/Button";

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

  const size = variant === "player" || variant === "compact" ? "sm" : "lg";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={buttonVariants({ variant: "ai", size })}
        title="Explore Movie Trivia & Facts"
      >
        <Sparkles size={variant === "compact" ? 13 : 16} />
        <span>{variant === "compact" ? "Trivia" : "Trivia & Facts"}</span>
      </button>

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
