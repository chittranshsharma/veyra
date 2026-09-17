"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Globe,
  Shield,
  HelpCircle,
  LogIn,
  LogOut,
  User as UserIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Trash2,
  Bookmark,
  RotateCcw,
  Sparkles,
  Server,
  Activity,
  AlertCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

interface SettingsClientProps {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: {
    username?: string;
    avatar_url?: string | null;
    created_at?: string;
  } | null;
  initialProgressCount: number;
  initialWatchlistCount: number;
}

type TabType = "performance" | "language" | "privacy" | "help";

export function SettingsClient({
  user,
  profile,
  initialProgressCount,
  initialWatchlistCount,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("performance");

  // Performance State
  const [perfMode, setPerfMode] = useState<"auto" | "performance" | "default" | "hd">("default");
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);

  // Language & Region State
  const [audioLang, setAudioLang] = useState("en");
  const [subtitleLang, setSubtitleLang] = useState("en");
  const [region, setRegion] = useState("US");

  // Privacy & Data State
  const [saveHistory, setSaveHistory] = useState(true);
  const [hideMature, setHideMature] = useState(false);
  const [progressCount, setProgressCount] = useState(initialProgressCount);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);
  const [tasteReset, setTasteReset] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync preference to Supabase when user is authenticated
  const syncPreference = async (key: string, value: any) => {
    if (!user) return;
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (err) {
      console.error("Failed to sync preference to Supabase:", err);
    }
  };

  // Load from localStorage on mount, then hydrate from Supabase if authenticated
  useEffect(() => {
    try {
      const savedPerf = localStorage.getItem("veyra_perf_mode");
      if (savedPerf && ["auto", "performance", "default", "hd"].includes(savedPerf)) {
        setPerfMode(savedPerf as any);
      }

      const savedHw = localStorage.getItem("veyra_hw_accel");
      if (savedHw !== null) setHardwareAccel(savedHw === "true");

      const savedAutoplay = localStorage.getItem("veyra_autoplay_next");
      if (savedAutoplay !== null) setAutoplayNext(savedAutoplay === "true");

      const savedAudio = localStorage.getItem("veyra_audio_lang");
      if (savedAudio) setAudioLang(savedAudio);

      const savedSub = localStorage.getItem("veyra_sub_lang");
      if (savedSub) setSubtitleLang(savedSub);

      const savedRegion = localStorage.getItem("veyra_region");
      if (savedRegion) setRegion(savedRegion);

      const savedHist = localStorage.getItem("veyra_save_history");
      if (savedHist !== null) setSaveHistory(savedHist === "true");

      const savedMature = localStorage.getItem("veyra_hide_mature");
      if (savedMature !== null) setHideMature(savedMature === "true");
    } catch {}

    // When authenticated, Supabase is the authoritative source of truth
    if (user) {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          if (data?.preferences) {
            const p = data.preferences;
            if (p.perf_mode) {
              setPerfMode(p.perf_mode);
              localStorage.setItem("veyra_perf_mode", p.perf_mode);
            }
            if (p.hardware_accel !== undefined) {
              setHardwareAccel(p.hardware_accel);
              localStorage.setItem("veyra_hw_accel", String(p.hardware_accel));
            }
            if (p.autoplay_next !== undefined) {
              setAutoplayNext(p.autoplay_next);
              localStorage.setItem("veyra_autoplay_next", String(p.autoplay_next));
            }
            if (p.audio_lang) {
              setAudioLang(p.audio_lang);
              localStorage.setItem("veyra_audio_lang", p.audio_lang);
            }
            if (p.subtitle_lang) {
              setSubtitleLang(p.subtitle_lang);
              localStorage.setItem("veyra_sub_lang", p.subtitle_lang);
            }
            if (p.region) {
              setRegion(p.region);
              localStorage.setItem("veyra_region", p.region);
            }
            if (p.save_history !== undefined) {
              setSaveHistory(p.save_history);
              localStorage.setItem("veyra_save_history", String(p.save_history));
            }
            if (p.hide_mature !== undefined) {
              setHideMature(p.hide_mature);
              localStorage.setItem("veyra_hide_mature", String(p.hide_mature));
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handlePerfChange = (mode: "auto" | "performance" | "default" | "hd") => {
    setPerfMode(mode);
    try {
      localStorage.setItem("veyra_perf_mode", mode);
    } catch {}
    syncPreference("perfMode", mode);
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your entire watch history?")) return;
    setIsClearingHistory(true);
    try {
      if (user) {
        await fetch("/api/progress", { method: "DELETE" });
      }
      setProgressCount(0);
      setHistoryCleared(true);
      setTimeout(() => setHistoryCleared(false), 3000);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleResetTaste = () => {
    try {
      localStorage.removeItem("veyra_decider_history");
      localStorage.removeItem("veyra_recommended_cache");
      setTasteReset(true);
      setTimeout(() => setTasteReset(false), 3000);
    } catch {}
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  const faqs = [
    {
      q: "How does Veyra source content & metadata?",
      a: "Veyra aggregates title metadata, posters, ratings, cast, and trailers directly from TMDB (The Movie Database). Playback links interface dynamically with fast, multi-CDN video streaming providers.",
    },
    {
      q: "Are video files hosted on Veyra servers?",
      a: "No media files are hosted, uploaded, or stored on Veyra servers. Veyra operates strictly as a cinematic interface and indexer that directs playback to verified third-party embedded players.",
    },
    {
      q: "Why can't I find a specific title?",
      a: "Our index queries TMDB's catalog of millions of titles. If a film was released very recently, try searching by its original international language title or release year.",
    },
    {
      q: "Experiencing buffering, black screen, or playback issues?",
      a: "If a video stalls, switch between the available video server providers in the player options, ensure ad-blockers are not blocking stream chunks, or select 'Auto' or 'Performance' mode.",
    },
    {
      q: "How does Watch Party synchronization work?",
      a: "Watch Party allows you to create or join a synchronized viewing session with a 6-character room code. Video playback, pauses, and timestamps stay in sync for everyone in the room.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
          Settings &amp; Preferences
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Customize video playback, privacy toggles, language, and account details.
        </p>
      </div>

      {/* Account / Sign-In Status Card */}
      <div
        className="rounded-2xl border border-border p-5 sm:p-6"
        style={{ background: "var(--bg-surface)" }}
      >
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-2xl font-black text-[var(--on-accent)] shadow-md shadow-accent/20">
                {profile?.username?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-lg font-bold text-text-primary">
                    {profile?.username ?? "Veyra Cinephile"}
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/25">
                    MEMBER
                  </span>
                </div>
                <p className="truncate text-xs sm:text-sm text-text-muted mt-0.5">{user.email}</p>
                <p className="text-[11px] text-text-muted/70 mt-0.5">Member since {joinDate}</p>
              </div>
            </div>

            <form action="/auth/signout" method="POST" className="shrink-0">
              <button
                type="submit"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto",
                })}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface2 text-text-muted border border-border">
                <UserIcon size={22} />
              </div>
              <div>
                <p className="font-display text-base font-bold text-text-primary">
                  Browsing as Guest
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Sign in to sync your Watchlist, save Continue Watching progress, and join Watch Parties.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/auth/login?redirectTo=/settings"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <LogIn size={14} />
                Sign In
              </Link>
              <Link
                href="/auth/signup?redirectTo=/settings"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar / Horizontal Tabs on Mobile + Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs (Horizontal Rail on Mobile / Sticky Sidebar on Desktop) */}
        <div className="lg:col-span-1">
          {/* Mobile Rail */}
          <div className="rail flex lg:hidden gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("performance")}
              className={`chip shrink-0 ${activeTab === "performance" ? "chip-active" : ""}`}
            >
              <Zap size={14} />
              Performance
            </button>
            <button
              onClick={() => setActiveTab("language")}
              className={`chip shrink-0 ${activeTab === "language" ? "chip-active" : ""}`}
            >
              <Globe size={14} />
              Language
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`chip shrink-0 ${activeTab === "privacy" ? "chip-active" : ""}`}
            >
              <Shield size={14} />
              Privacy &amp; Data
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`chip shrink-0 ${activeTab === "help" ? "chip-active" : ""}`}
            >
              <HelpCircle size={14} />
              FAQ &amp; Help
            </button>
          </div>

          {/* Desktop Sidebar */}
          <div
            className="hidden lg:flex flex-col gap-1 rounded-2xl border border-border p-3 sticky top-24"
            style={{ background: "var(--bg-surface)" }}
          >
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                activeTab === "performance"
                  ? "bg-accent text-[var(--on-accent)] font-bold shadow-md shadow-accent/20"
                  : "text-text-secondary hover:bg-surface2 hover:text-text-primary"
              }`}
            >
              <Zap size={16} />
              Performance
            </button>
            <button
              onClick={() => setActiveTab("language")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                activeTab === "language"
                  ? "bg-accent text-[var(--on-accent)] font-bold shadow-md shadow-accent/20"
                  : "text-text-secondary hover:bg-surface2 hover:text-text-primary"
              }`}
            >
              <Globe size={16} />
              Language &amp; Region
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                activeTab === "privacy"
                  ? "bg-accent text-[var(--on-accent)] font-bold shadow-md shadow-accent/20"
                  : "text-text-secondary hover:bg-surface2 hover:text-text-primary"
              }`}
            >
              <Shield size={16} />
              Privacy &amp; Data
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                activeTab === "help"
                  ? "bg-accent text-[var(--on-accent)] font-bold shadow-md shadow-accent/20"
                  : "text-text-secondary hover:bg-surface2 hover:text-text-primary"
              }`}
            >
              <HelpCircle size={16} />
              Help &amp; FAQ
            </button>

            {/* System Status Footnote */}
            <div className="mt-6 pt-4 border-t border-border px-2">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px]">veyra.app · online</span>
              </div>
              <p className="mt-1 text-[10px] text-text-muted/60">Edge streaming CDN healthy</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: PERFORMANCE */}
          {activeTab === "performance" && (
            <div
              className="rounded-2xl border border-border p-5 sm:p-7 space-y-6"
              style={{ background: "var(--bg-surface)" }}
            >
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                  <Zap size={20} className="text-accent" />
                  Playback &amp; Rendering Quality
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Tune video stream resolution, hardware acceleration, and client interface animations.
                </p>
              </div>

              {/* 4-pill segmented controller */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Quality Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: "auto", label: "Auto", desc: "Adaptive throughput" },
                      { id: "performance", label: "Performance", desc: "Low CPU / battery" },
                      { id: "default", label: "Default", desc: "Balanced 1080p" },
                      { id: "hd", label: "HD / 4K", desc: "Max fidelity" },
                    ] as const
                  ).map((m) => {
                    const isSel = perfMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handlePerfChange(m.id)}
                        className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                          isSel
                            ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/30"
                            : "border-border bg-surface2 text-text-secondary hover:border-border-hover"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-bold ${isSel ? "text-accent" : "text-text-primary"}`}>
                            {m.label}
                          </span>
                          {isSel && <Check size={14} className="text-accent" />}
                        </div>
                        <span className="text-[11px] text-text-muted mt-1 leading-tight">
                          {m.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional performance toggles */}
              <div className="divide-y divide-border pt-2">
                {/* Hardware Acceleration */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Hardware Video Acceleration
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Use GPU video decoding for smoother 60fps playback and reduced power consumption.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !hardwareAccel;
                      setHardwareAccel(next);
                      localStorage.setItem("veyra_hw_accel", String(next));
                      syncPreference("hardwareAccel", next);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hardwareAccel ? "bg-accent" : "bg-surface2 border-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        hardwareAccel ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Autoplay Next Episode */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Autoplay Next Episode
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Automatically load and start the next episode when watching a TV series.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoplayNext;
                      setAutoplayNext(next);
                      localStorage.setItem("veyra_autoplay_next", String(next));
                      syncPreference("autoplayNext", next);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoplayNext ? "bg-accent" : "bg-surface2 border-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoplayNext ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LANGUAGE & REGION */}
          {activeTab === "language" && (
            <div
              className="rounded-2xl border border-border p-5 sm:p-7 space-y-6"
              style={{ background: "var(--bg-surface)" }}
            >
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                  <Globe size={20} className="text-accent" />
                  Language &amp; Regional Catalog
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Choose your default audio tracks, subtitles, and regional release catalog.
                </p>
              </div>

              <div className="space-y-4">
                {/* Audio Language */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Default Audio Language
                  </label>
                  <select
                    value={audioLang}
                    onChange={(e) => {
                      setAudioLang(e.target.value);
                      localStorage.setItem("veyra_audio_lang", e.target.value);
                      syncPreference("audioLang", e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    <option value="en">English (Original / Dub)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="ja">Japanese (日本語)</option>
                    <option value="ko">Korean (한국어)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="it">Italian (Italiano)</option>
                    <option value="pt">Portuguese (Português)</option>
                  </select>
                </div>

                {/* Subtitles Language */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Default Subtitles
                  </label>
                  <select
                    value={subtitleLang}
                    onChange={(e) => {
                      setSubtitleLang(e.target.value);
                      localStorage.setItem("veyra_sub_lang", e.target.value);
                      syncPreference("subtitleLang", e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    <option value="en">English [CC]</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="off">Off by default</option>
                  </select>
                </div>

                {/* Region / Release Catalog */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Catalog Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      localStorage.setItem("veyra_region", e.target.value);
                      syncPreference("region", e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    <option value="US">United States (Global TMDB)</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="JP">Japan</option>
                    <option value="EU">Europe (Multi-regional)</option>
                  </select>
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Controls default release dates, age ratings certification (e.g. PG-13 / TV-MA), and localized summaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & DATA */}
          {activeTab === "privacy" && (
            <div
              className="rounded-2xl border border-border p-5 sm:p-7 space-y-6"
              style={{ background: "var(--bg-surface)" }}
            >
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                  <Shield size={20} className="text-accent" />
                  Privacy, History &amp; Storage
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Manage your watch session history, content filtering, and recommendation preferences.
                </p>
              </div>

              {/* Toggles */}
              <div className="divide-y divide-border">
                {/* Save Watch History */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Save Watch History &amp; Progress
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Store playback timestamps to resume where you left off across sessions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !saveHistory;
                      setSaveHistory(next);
                      localStorage.setItem("veyra_save_history", String(next));
                      syncPreference("saveHistory", next);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      saveHistory ? "bg-accent" : "bg-surface2 border-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        saveHistory ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Hide Mature Content */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Filter Mature Content (Safe Mode)
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Filter explicit, adult, or unrated titles from search results and trending rails.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !hideMature;
                      setHideMature(next);
                      localStorage.setItem("veyra_hide_mature", String(next));
                      syncPreference("hideMature", next);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hideMature ? "bg-accent" : "bg-surface2 border-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        hideMature ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Data Actions Grid */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Stored Data &amp; Library
                </h3>

                {/* Continue Watching Cleaner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        Continue Watching
                      </p>
                      <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-mono font-bold text-text-muted">
                        {progressCount} in progress
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Clear your current unfinished movies and series from the homepage rail.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    disabled={isClearingHistory || progressCount === 0}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                    {isClearingHistory ? "Clearing…" : historyCleared ? "Cleared!" : "Clear Rail"}
                  </button>
                </div>

                {/* Watchlist Quick Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        My Saved Watchlist
                      </p>
                      <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-mono font-bold text-text-muted">
                        {initialWatchlistCount} saved
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      View, sort, or manage your personal bookmark list.
                    </p>
                  </div>
                  <Link
                    href="/watchlist"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text-primary hover:border-accent hover:text-accent active:scale-95 transition"
                  >
                    <Bookmark size={13} />
                    Open Watchlist →
                  </Link>
                </div>

                {/* Reset Decider & Taste profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Reset Decider &amp; AI Recommendations
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Wipes swiped cards history and taste affinities to start fresh.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetTaste}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text-secondary hover:text-text-primary active:scale-95 transition"
                  >
                    <RotateCcw size={13} />
                    {tasteReset ? "Taste Reset!" : "Reset Taste"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HELP & FAQ */}
          {activeTab === "help" && (
            <div
              className="rounded-2xl border border-border p-5 sm:p-7 space-y-6"
              style={{ background: "var(--bg-surface)" }}
            >
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                  <HelpCircle size={20} className="text-accent" />
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Learn how Veyra indexes cinema, handles stream playback, and guarantees privacy.
                </p>
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-surface2 overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm text-text-primary hover:text-accent transition"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-text-muted transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-accent" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/50 bg-surface/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notice Banner */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs text-amber-300/90 leading-relaxed">
                <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-400">Important Disclaimer</p>
                  <p className="mt-0.5">
                    Veyra is an experimental open-source cinematic interface. We do not host or broadcast any media streams. All film posters, titles, and metadata are provided courtesy of TMDB under CC BY-NC 4.0.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
