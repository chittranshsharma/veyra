"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { AutoNextCountdown } from "@/components/player/AutoNextCountdown";
import { AiRecapButton } from "@/components/ai/AiRecapButton";
import { AiXRayButton } from "@/components/ai/AiXRayButton";
import { tmdbImage } from "@/lib/tmdb/image";
import { buttonVariants } from "@/components/ui/Button";

// This page receives pre-fetched data from the server wrapper below
interface WatchTVClientProps {
  tmdbId: number;
  seasonNum: number;
  episodeNum: number;
  showName: string;
  currentEpisodeName: string;
  currentSeasonName?: string;
  currentEpisodeOverview: string;
  hasPrev: boolean;
  hasNext: boolean;
  prevHref: string;
  nextHref: string;
  nextEpisodeName: string;
  nextEpisodeStill?: string | null;
  nextSeasonNumber: number;
  nextEpisodeNumber: number;
  resumeAtSeconds?: number;
  tvId: string;
}

export function WatchTVClient({
  tmdbId,
  seasonNum,
  episodeNum,
  showName,
  currentEpisodeName,
  currentSeasonName,
  currentEpisodeOverview,
  hasPrev,
  hasNext,
  prevHref,
  nextHref,
  nextEpisodeName,
  nextEpisodeStill,
  nextSeasonNumber,
  nextEpisodeNumber,
  resumeAtSeconds,
  tvId,
}: WatchTVClientProps) {
  const [showToast, setShowToast] = useState(false);

  const handleEnded = () => {
    if (hasNext) setShowToast(true);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/tv/${tmdbId}`}
          className="flex items-center gap-1 text-sm text-muted transition hover:text-white"
        >
          <ChevronLeft size={16} />
          {showName}
        </Link>
        <span className="text-muted/40">/</span>
        <span className="text-sm text-muted">
          S{String(seasonNum).padStart(2, "0")}E{String(episodeNum).padStart(2, "0")}
        </span>
      </div>

      {/* Player + floating toast container */}
      <div className="relative">
        <VideoPlayer
          tmdbId={tmdbId}
          mediaType="tv"
          season={seasonNum}
          episode={episodeNum}
          resumeAtSeconds={resumeAtSeconds}
          onEnded={handleEnded}
        />

        {/* Next episode auto countdown & binge mode */}
        {hasNext && (
          <AutoNextCountdown
            show={showToast}
            nextHref={nextHref}
            nextEpisodeName={nextEpisodeName}
            nextEpisodeNumber={nextEpisodeNumber}
            nextSeasonNumber={nextSeasonNumber}
            nextEpisodeStill={nextEpisodeStill}
            onDismiss={() => setShowToast(false)}
          />
        )}
      </div>

      {/* Episode nav & AI Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {hasPrev && (
            <Link
              href={prevHref}
              className="flex items-center gap-1.5 rounded-lg bg-surface px-4 py-2 text-sm font-medium text-white transition hover:bg-surface2"
            >
              <ChevronLeft size={16} />
              Previous
            </Link>
          )}
          <AiRecapButton
            showName={showName}
            seasonNumber={seasonNum}
            episodeNumber={episodeNum}
            episodeName={currentEpisodeName}
            episodeOverview={currentEpisodeOverview}
            variant="player"
          />
          <AiXRayButton
            title={showName}
            mediaType="tv"
            overview={currentEpisodeOverview}
            variant="player"
          />
        </div>

        {hasNext && (
          <Link
            href={nextHref}
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Next Episode
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Episode info */}
      <div className="mt-6 space-y-2">
        <p className="text-sm text-muted">
          {currentSeasonName} • Episode {episodeNum}
        </p>
        <h2 className="gradient-heading font-display text-xl font-bold">
          {currentEpisodeName}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          {currentEpisodeOverview}
        </p>
      </div>
    </main>
  );
}
