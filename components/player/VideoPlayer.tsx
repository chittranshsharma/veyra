"use client";

import { useEffect, useMemo, useRef } from "react";
import { vidkingEventSchema } from "@/lib/validation/progress";

const VIDKING_ORIGIN = "https://www.vidking.net";
const ACCENT_COLOR = "00e5c7"; // matches tailwind `accent` token, no leading #

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  resumeAtSeconds?: number;
}

export function VideoPlayer({
  tmdbId,
  mediaType,
  season,
  episode,
  resumeAtSeconds,
}: VideoPlayerProps) {
  const lastSentAtRef = useRef(0);

  const embedUrl = useMemo(() => {
    const base =
      mediaType === "movie"
        ? `${VIDKING_ORIGIN}/embed/movie/${tmdbId}`
        : `${VIDKING_ORIGIN}/embed/tv/${tmdbId}/${season}/${episode}`;

    const params = new URLSearchParams({
      color: ACCENT_COLOR,
      autoPlay: "true",
      ...(mediaType === "tv" ? { nextEpisode: "true", episodeSelector: "true" } : {}),
      ...(resumeAtSeconds ? { progress: String(Math.floor(resumeAtSeconds)) } : {}),
    });

    return `${base}?${params.toString()}`;
  }, [tmdbId, mediaType, season, episode, resumeAtSeconds]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only trust messages from Vidking's own origin.
      if (event.origin !== VIDKING_ORIGIN) return;

      const parsed = vidkingEventSchema.safeParse(event.data);
      if (!parsed.success) return;

      const { event: playerEvent, currentTime, duration, progress } = parsed.data.data;

      // Debounce timeupdate: only persist every ~10s, but always persist
      // meaningful state-change events (pause/ended/seeked) immediately.
      const now = Date.now();
      const isThrottled =
        playerEvent === "timeupdate" && now - lastSentAtRef.current < 10_000;
      if (isThrottled) return;
      lastSentAtRef.current = now;

      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          season: season ?? null,
          episode: episode ?? null,
          progressSeconds: currentTime,
          durationSeconds: duration,
          progressPercent: progress,
        }),
      }).catch(() => {
        // Best-effort only — losing a progress tick isn't worth surfacing an error.
      });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [tmdbId, mediaType, season, episode]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video">
      <iframe
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        frameBorder={0}
        allowFullScreen
        title="Video player"
      />
    </div>
  );
}
