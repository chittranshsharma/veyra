"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { vidkingEventSchema } from "@/lib/validation/progress";
import { Server, HelpCircle, AlertCircle, RefreshCw } from "lucide-react";
import { PlayerHUD, type HUDAction } from "./PlayerHUD";
import { SubtitleOverlay } from "./SubtitleOverlay";

const ACCENT_COLOR = "00e5c7";

// Stream server definitions
const SERVERS = [
  {
    label: "VidKing",
    movieUrl: (id: number) => `https://www.vidking.net/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}`,
    origin: "https://www.vidking.net",
    supportsProgress: true,
  },
  {
    label: "VidSrc",
    movieUrl: (id: number) => `https://vidsrc.to/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    origin: "https://vidsrc.to",
    supportsProgress: false,
  },
  {
    label: "SuperEmbed",
    movieUrl: (id: number) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tvUrl: (id: number, s: number, e: number) =>
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    origin: "https://multiembed.mov",
    supportsProgress: false,
  },
];

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  resumeAtSeconds?: number;
  onEnded?: () => void;
}

export function VideoPlayer({
  tmdbId,
  mediaType,
  season,
  episode,
  resumeAtSeconds,
  onEnded,
}: VideoPlayerProps) {
  const lastSentAtRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize active server from localStorage if available
  const [activeServer, setActiveServerState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("veyra_preferred_server");
      if (saved) {
        const idx = SERVERS.findIndex((s) => s.label === saved);
        if (idx !== -1) return idx;
      }
    }
    return 0;
  });

  const setActiveServer = (index: number) => {
    setActiveServerState(index);
    if (typeof window !== "undefined") {
      localStorage.setItem("veyra_preferred_server", SERVERS[index]?.label ?? "VidKing");
    }
    showHUD({ type: "server", serverName: SERVERS[index]?.label ?? "Server" });
    setStreamStalled(false);
  };

  const [currentTime, setCurrentTime] = useState<number>(resumeAtSeconds ?? 0);
  const [hudAction, setHudAction] = useState<HUDAction | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamStalled, setStreamStalled] = useState(false);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHUD = useCallback((action: HUDAction) => {
    setHudAction(action);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => setHudAction(null), 1200);
  }, []);

  // Server object
  const server = SERVERS[Math.min(activeServer, SERVERS.length - 1)]!;

  const embedUrl = useMemo(() => {
    const base =
      mediaType === "movie"
        ? server.movieUrl(tmdbId)
        : server.tvUrl(tmdbId, season!, episode!);

    if (activeServer === 0) {
      // VidKing supports extra params
      const params = new URLSearchParams({
        color: ACCENT_COLOR,
        autoPlay: "true",
        ...(mediaType === "tv" ? { nextEpisode: "true", episodeSelector: "true" } : {}),
        ...(resumeAtSeconds ? { progress: String(Math.floor(resumeAtSeconds)) } : {}),
      });
      return `${base}?${params.toString()}`;
    }

    return base;
  }, [tmdbId, mediaType, season, episode, resumeAtSeconds, activeServer, server]);

  // Failover health monitor: if stream takes > 10s without event, prompt server switch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastSentAtRef.current === 0 && activeServer === 0) {
        setStreamStalled(true);
      }
    }, 10_000);
    return () => clearTimeout(timer);
  }, [activeServer]);

  // Global Pro Cinema Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore keystrokes when typing inside inputs, textareas, or modals
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          showHUD({ type: "play" });
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentTime((t) => t + 10);
          showHUD({ type: "seek_forward", seconds: 10 });
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentTime((t) => Math.max(0, t - 10));
          showHUD({ type: "seek_backward", seconds: 10 });
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.();
            showHUD({ type: "fullscreen", isFullscreen: true });
          } else {
            document.exitFullscreen?.();
            showHUD({ type: "fullscreen", isFullscreen: false });
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          setIsMuted((prev) => {
            const next = !prev;
            showHUD({ type: "mute", isMuted: next });
            return next;
          });
          break;
        case "s":
        case "S":
          e.preventDefault();
          setActiveServer((activeServer + 1) % SERVERS.length);
          break;
        case "?":
          e.preventDefault();
          setShowHelp((h) => !h);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeServer, showHUD]);

  // PostMessage listener for progress & time updates
  useEffect(() => {
    if (!server.supportsProgress) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== server.origin) return;

      const parsed = vidkingEventSchema.safeParse(event.data);
      if (!parsed.success) return;

      const { event: playerEvent, currentTime: eventCurrentTime, duration, progress } =
        parsed.data.data;

      setCurrentTime(eventCurrentTime);
      setStreamStalled(false);

      if (playerEvent === "ended" && onEnded) {
        onEnded();
      }

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
          progressSeconds: eventCurrentTime,
          durationSeconds: duration,
          progressPercent: progress,
        }),
      }).catch(() => {});
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [tmdbId, mediaType, season, episode, server, onEnded]);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video ring-1 ring-white/5 group"
      >
        <iframe
          key={embedUrl}
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          frameBorder={0}
          allowFullScreen
          title="Video player"
          allow="autoplay; fullscreen; picture-in-picture"
        />

        {/* Pro Cinema Keyboard HUD Overlay */}
        <PlayerHUD
          currentAction={hudAction}
          showHelp={showHelp}
          onCloseHelp={() => setShowHelp(false)}
        />

        {/* External Subtitle Overlay & Styler */}
        <SubtitleOverlay currentTime={currentTime} />

        {/* Stream Failover Health Alert Pill */}
        {streamStalled && (
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-black/80 px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md animate-fade-in">
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <span>Buffering slow?</span>
            <button
              onClick={() => setActiveServer(1)}
              className="flex items-center gap-1 rounded-lg bg-amber-400/20 px-2 py-0.5 text-white hover:bg-amber-400/30 transition ml-1"
            >
              <RefreshCw size={11} />
              Switch to VidSrc
            </button>
            <button
              onClick={() => setStreamStalled(false)}
              className="text-white/50 hover:text-white ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Server switcher & Pro shortcuts trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-muted shrink-0" />
          <span className="text-xs text-muted mr-1">Server:</span>
          {SERVERS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActiveServer(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                activeServer === i
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "bg-surface text-muted hover:bg-surface2 hover:text-white"
              }`}
            >
              {s.label}
              {activeServer === i && s.supportsProgress && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-accent transition"
          >
            <HelpCircle size={13} />
            <span>Shortcuts (Press ?)</span>
          </button>
          <span className="text-[10px] text-muted/60">
            {server.supportsProgress ? "✓ Progress sync active" : "Basic playback"}
          </span>
        </div>
      </div>
    </div>
  );
}

