"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { vidkingEventSchema } from "@/lib/validation/progress";
import { Server, HelpCircle, AlertCircle, RefreshCw, Subtitles } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { PlayerHUD, type HUDAction } from "./PlayerHUD";
import { SubtitleOverlay } from "./SubtitleOverlay";

const ACCENT_COLOR = "ef7b44";

// Stream server definitions — VidKing primary with verified working multi-server fallbacks
const SERVERS = [
  {
    label: "VidKing",
    badge: "Primary · Sync",
    movieUrl: (id: number) => `https://www.vidking.net/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}`,
    origin: "https://www.vidking.net",
    supportsProgress: true,
  },
  {
    label: "AutoEmbed",
    badge: "Direct 1080p",
    movieUrl: (id: number) => `https://autoembed.co/movie/tmdb/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
    origin: "https://autoembed.co",
    supportsProgress: false,
  },
  {
    label: "VidLink",
    badge: "Ultra HD · AutoSubs",
    movieUrl: (id: number) =>
      `https://vidlink.pro/movie/${id}?primaryColor=ef7b44&secondaryColor=18181b&iconColor=ef7b44&title=true&poster=true&autoplay=false`,
    tvUrl: (id: number, s: number, e: number) =>
      `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=ef7b44&secondaryColor=18181b&iconColor=ef7b44&title=true&poster=true&autoplay=false`,
    origin: "https://vidlink.pro",
    supportsProgress: false,
  },
  {
    label: "2Embed",
    badge: "Direct Stream",
    movieUrl: (id: number) => `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    origin: "https://www.2embed.cc",
    supportsProgress: false,
  },
  {
    label: "VidSrc PM",
    badge: "Fast Edge",
    movieUrl: (id: number) => `https://vidsrc.pm/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
    origin: "https://vidsrc.pm",
    supportsProgress: false,
  },
  {
    label: "VidSrc Pro",
    badge: "Multi-Mirror",
    movieUrl: (id: number) => `https://vidsrc.pro/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`,
    origin: "https://vidsrc.pro",
    supportsProgress: false,
  },
  {
    label: "Smashy",
    badge: "Backup Mirror",
    movieUrl: (id: number) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tvUrl: (id: number, s: number, e: number) =>
      `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`,
    origin: "https://embed.smashystream.com",
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
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [streamStalled, setStreamStalled] = useState(false);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHUD = useCallback((action: HUDAction) => {
    setHudAction(action);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => setHudAction(null), 1200);
  }, []);

  const server = (SERVERS[activeServer] ?? SERVERS[0])!;

  const embedUrl = useMemo(() => {
    const base =
      mediaType === "movie"
        ? server.movieUrl(tmdbId)
        : server.tvUrl(tmdbId, season!, episode!);

    if (server.label === "VidKing") {
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
        case "c":
        case "C":
          e.preventDefault();
          setShowSubtitlesModal((prev) => !prev);
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
        data-cinema-dark
        className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video ring-1 ring-white/5 group"
      >
        <iframe
          key={embedUrl}
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          frameBorder={0}
          allowFullScreen
          title="Video player"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
        />

        {/* Pro Cinema Keyboard HUD Overlay */}
        <PlayerHUD
          currentAction={hudAction}
          showHelp={showHelp}
          onCloseHelp={() => setShowHelp(false)}
        />

        {/* Automated Internet Subtitle Overlay & Styler */}
        <SubtitleOverlay
          currentTime={currentTime}
          tmdbId={tmdbId}
          mediaType={mediaType}
          season={season}
          episode={episode}
          isOpen={showSubtitlesModal}
          onClose={() => setShowSubtitlesModal(false)}
          onTrackChange={(track) => setActiveSubtitleTrack(track)}
        />

        {/* Stream Failover Health Alert Pill */}
        {streamStalled && (
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-black/80 px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md animate-fade-in">
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <span>Buffering slow?</span>
            <button
              onClick={() => setActiveServer((activeServer + 1) % SERVERS.length)}
              className={buttonVariants({ variant: "subtle", size: "xs" }) + " ml-1 text-amber-200 border-amber-500/25 hover:bg-amber-500/10"}
            >
              <RefreshCw size={11} />
              Try Next Server
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

      {/* Server switcher & shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted mr-1">
            <Server size={14} className="text-accent shrink-0" />
            <span>Server</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {SERVERS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActiveServer(i)}
                className={
                  activeServer === i
                    ? buttonVariants({ variant: "primary", size: "xs" })
                    : buttonVariants({ variant: "secondary", size: "xs" })
                }
                title={s.badge}
              >
                <span>{s.label}</span>
                {activeServer === i && s.supportsProgress && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--on-accent)] align-middle opacity-80" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Subtitles & Audio Timing Button in toolbar — NEVER covers player controls */}
          <button
            onClick={() => setShowSubtitlesModal(true)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              activeSubtitleTrack
                ? "bg-accent text-[var(--on-accent)] font-semibold shadow-sm"
                : "border border-border bg-surface2 text-muted hover:text-text-primary hover:bg-surface"
            }`}
            title="Choose Subtitles & Adjust Audio Timing (Press C)"
          >
            <Subtitles size={13} />
            <span>{activeSubtitleTrack ? `CC: ${activeSubtitleTrack}` : "Subtitles"}</span>
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-accent transition"
          >
            <HelpCircle size={13} />
            <span>Shortcuts (?)</span>
          </button>
          <span className="text-[10px] text-muted/60 hidden sm:inline">
            {server.supportsProgress ? "✓ Progress sync active" : "Basic playback"}
          </span>
        </div>
      </div>
    </div>
  );
}

