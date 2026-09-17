"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Copy,
  Check,
  Play,
  ArrowLeft,
  Share2,
  Sparkles,
  Search,
  MessageSquare,
  Send,
  Radio,
  UserPlus,
  Edit2,
  X,
  Maximize2,
  Film,
  Tv,
  Star,
} from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";
import { buttonVariants } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { VideoPlayer } from "@/components/player/VideoPlayer";

interface PartyPageProps {
  params: Promise<{ code: string }>;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  avatar: string;
  status: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  avatar: string;
}

export interface StreamItem {
  id: number;
  title: string;
  type: "movie" | "tv";
  posterPath: string | null;
  backdropPath?: string | null;
  year: string;
  voteAverage?: number;
}

const RANDOM_AVATARS = ["🍿", "🎬", "🌙", "🎭", "🎥", "🪐", "🍕", "✨"];

export default function WatchPartyRoomPage({ params }: PartyPageProps) {
  const resolvedParams = use(params);
  const code = resolvedParams.code.toUpperCase();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  const initialId = searchParams.get("id");
  const initialType = (searchParams.get("type") as "movie" | "tv") || "movie";

  const [copied, setCopied] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<StreamItem | null>(null);
  const [isWatchingInLounge, setIsWatchingInLounge] = useState(false);

  // User identity state
  const [myUserId, setMyUserId] = useState<string>("");
  const [myName, setMyName] = useState<string>("");
  const [myAvatar, setMyAvatar] = useState<string>("🍿");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Room presence & chat
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // Dynamic search & catalog browsing
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StreamItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularTab, setPopularTab] = useState<"movie" | "tv">("movie");
  const [popularItems, setPopularItems] = useState<StreamItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize current user identity
  useEffect(() => {
    const supabase = createClient();

    const initUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let uid = "";
      let name = "";
      let avatar = "🍿";

      if (user) {
        uid = user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();

        name = profile?.username ?? user.email?.split("@")[0] ?? "Cinephile";
        avatar = isHost ? "👑" : "🎬";
      } else {
        const storedUid = localStorage.getItem("veyra_party_uid");
        const storedName = localStorage.getItem("veyra_party_name");
        const storedAvatar = localStorage.getItem("veyra_party_avatar");

        uid = storedUid ?? `guest_${Math.random().toString(36).slice(2, 9)}`;
        name = storedName ?? `Guest ${Math.floor(100 + Math.random() * 900)}`;
        avatar = storedAvatar ?? (isHost ? "👑" : RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)]!);

        localStorage.setItem("veyra_party_uid", uid);
        localStorage.setItem("veyra_party_name", name);
        localStorage.setItem("veyra_party_avatar", avatar);
      }

      setMyUserId(uid);
      setMyName(name);
      setNameInput(name);
      setMyAvatar(avatar);

      // Local initial user entry
      setParticipants([
        {
          id: uid,
          name,
          isHost,
          avatar,
          status: "Synced",
        },
      ]);

      // Initial clean system notice
      setMessages([
        {
          id: "sys_init",
          sender: "System",
          text: `Party room #${code} created. Chat, react with emojis, and share titles with your friends in this lounge!`,
          time: "Just now",
          avatar: "🍿",
        },
      ]);
    };

    initUser();
  }, [code, isHost]);

  // Load initial popular titles from TMDB (dynamically, not hardcoded!)
  useEffect(() => {
    setLoadingPopular(true);
    fetch(`/api/tmdb/popular?type=${popularTab}&page=1`)
      .then((r) => r.json())
      .then((data) => {
        const items: StreamItem[] = (data.results ?? []).slice(0, 10).map((r: any) => ({
          id: r.id,
          title: r.title ?? r.name ?? "Untitled",
          type: r.media_type ?? popularTab,
          posterPath: r.poster_path,
          backdropPath: r.backdrop_path,
          year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4),
          voteAverage: r.vote_average,
        }));
        setPopularItems(items);
        // Default select the #1 popular title if no title selected yet
        setSelectedTitle((current) => current ?? items[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingPopular(false));
  }, [popularTab]);

  // If specific title requested in query params, fetch its details
  useEffect(() => {
    if (initialId) {
      fetch(`/api/tmdb/search?q=${encodeURIComponent(initialId)}&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          const match = data.results?.[0];
          if (match) {
            setSelectedTitle({
              id: match.id,
              title: match.title ?? match.name ?? "Untitled",
              type: match.media_type ?? initialType,
              posterPath: match.poster_path,
              backdropPath: match.backdrop_path,
              year: (match.release_date ?? match.first_air_date ?? "").slice(0, 4),
              voteAverage: match.vote_average,
            });
          }
        })
        .catch(() => {});
    }
  }, [initialId, initialType]);

  // Live debounced search across all of TMDB
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        const data = await res.json();
        const results: StreamItem[] = (data.results ?? []).map((r: any) => ({
          id: r.id,
          title: r.title ?? r.name ?? "Untitled",
          type: r.media_type ?? (r.title ? "movie" : "tv"),
          posterPath: r.poster_path,
          backdropPath: r.backdrop_path,
          year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4),
          voteAverage: r.vote_average,
        }));
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  }, [searchQuery]);

  // Connect to Supabase Realtime Channel
  useEffect(() => {
    if (!myUserId || !myName) return;

    const supabase = createClient();
    const channel = supabase.channel(`party_room_${code}`, {
      config: {
        presence: { key: myUserId },
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    // Listen for presence state sync
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: Participant[] = [];

        Object.values(presenceState).forEach((presences: any) => {
          if (Array.isArray(presences)) {
            presences.forEach((p: any) => {
              if (p?.id) {
                activeUsers.push({
                  id: p.id,
                  name: p.name ?? "Guest",
                  isHost: Boolean(p.isHost),
                  avatar: p.avatar ?? "🍿",
                  status: p.status ?? "Synced",
                });
              }
            });
          }
        });

        if (activeUsers.length > 0) {
          const seen = new Set<string>();
          const deduped: Participant[] = [];
          activeUsers.forEach((u) => {
            if (!seen.has(u.id)) {
              seen.add(u.id);
              deduped.push(u);
            }
          });
          setParticipants(deduped);
        }
      })
      .on("presence", { event: "join" }, ({ newPresences }: any) => {
        if (Array.isArray(newPresences)) {
          newPresences.forEach((p: any) => {
            if (p?.name && p.id !== myUserId) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `join_${Date.now()}_${p.id}`,
                  sender: "System",
                  text: `${p.name} joined the room`,
                  time: "Just now",
                  avatar: "👋",
                },
              ]);
            }
          });
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }: any) => {
        if (Array.isArray(leftPresences)) {
          leftPresences.forEach((p: any) => {
            if (p?.name && p.id !== myUserId) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `leave_${Date.now()}_${p.id}`,
                  sender: "System",
                  text: `${p.name} left the room`,
                  time: "Just now",
                  avatar: "👋",
                },
              ]);
            }
          });
        }
      })
      .on("broadcast", { event: "chat" }, ({ payload }: { payload: ChatMessage }) => {
        if (payload) {
          setMessages((prev) => [...prev, payload]);
        }
      })
      .on("broadcast", { event: "reaction" }, ({ payload }: { payload: { emoji: string } }) => {
        if (payload?.emoji) {
          triggerReaction(payload.emoji, false);
        }
      })
      .on("broadcast", { event: "title_change" }, ({ payload }: { payload: StreamItem }) => {
        if (payload?.id) {
          setSelectedTitle(payload);
          setMessages((prev) => [
            ...prev,
            {
              id: `title_${Date.now()}`,
              sender: "System",
              text: `Switched stream to "${payload.title}"`,
              time: "Just now",
              avatar: "🎬",
            },
          ]);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: myUserId,
            name: myName,
            isHost,
            avatar: myAvatar,
            status: "Synced",
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [code, myUserId, myName, myAvatar, isHost]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `Join my Veyra Watch Party (#${code})`,
          text: `Watch movies together in sync on Veyra! Use room code: ${code}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const updated = nameInput.trim();
    setMyName(updated);
    setIsEditingName(false);
    localStorage.setItem("veyra_party_name", updated);

    if (channelRef.current) {
      await channelRef.current.track({
        id: myUserId,
        name: updated,
        isHost,
        avatar: myAvatar,
        status: "Synced",
      });
    }

    setParticipants((prev) =>
      prev.map((p) => (p.id === myUserId ? { ...p, name: updated } : p))
    );
  };

  const handleSelectTitle = (title: StreamItem) => {
    setSelectedTitle(title);
    setSearchQuery("");
    setSearchResults([]);

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "title_change",
        payload: title,
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `title_me_${Date.now()}`,
        sender: "System",
        text: `You switched stream to "${title.title}"`,
        time: "Just now",
        avatar: "🎬",
      },
    ]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg: ChatMessage = {
      id: `${Date.now()}_${Math.random()}`,
      sender: myName,
      text: chatInput.trim(),
      time: "Just now",
      avatar: myAvatar,
    };

    setMessages((prev) => [...prev, msg]);
    setChatInput("");

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "chat",
        payload: msg,
      });
    }
  };

  const triggerReaction = useCallback(
    (emoji: string, broadcast = true) => {
      const id = Date.now() + Math.random();
      const left = Math.floor(Math.random() * 80) + 10;
      setFloatingEmojis((prev) => [...prev, { id, emoji, left }]);

      if (broadcast && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "reaction",
          payload: { emoji },
        });
      }

      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
      }, 2000);
    },
    []
  );

  const theaterHref = selectedTitle
    ? selectedTitle.type === "tv"
      ? `/watch/tv/${selectedTitle.id}/1/1`
      : `/watch/movie/${selectedTitle.id}`
    : null;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 pb-32 max-w-7xl mx-auto space-y-6">
      {/* Top Bar Navigation & Room Code Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted hover:text-text-primary transition"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Live Watch Party
              </span>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-black text-accent border border-accent/25">
                ROOM #{code}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="font-display text-xl sm:text-2xl font-black text-text-primary">
                Cinema Party Lounge
              </h1>

              {/* Your name indicator / quick editor */}
              <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface2 px-2.5 py-1 rounded-lg border border-border">
                <span>{myAvatar}</span>
                {isEditingName ? (
                  <form onSubmit={handleUpdateName} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-24 bg-surface text-text-primary px-1.5 py-0.5 rounded border border-accent text-xs outline-none"
                      autoFocus
                    />
                    <button type="submit" className="text-accent text-[11px] font-bold">
                      Save
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-1 hover:text-text-primary transition"
                    title="Edit display name"
                  >
                    <span className="font-semibold text-text-primary">{myName}</span>
                    <Edit2 size={11} className="text-text-muted" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Room actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text-primary hover:border-accent transition active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Code Copied!" : `Code: ${code}`}</span>
          </button>
          <button
            onClick={handleShare}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <Share2 size={14} />
            <span>Invite Friends</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stream Player Preview & Title Selection (Left) + Party Chat & Presence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Movie & Playback Ready */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Synced Title Card / In-Lounge Player */}
          {selectedTitle && (
            <div
              className="relative overflow-hidden rounded-3xl border border-border p-5 sm:p-7"
              style={{ background: "var(--bg-surface)" }}
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

              {/* Toggle: Watch in Lounge vs Card Preview */}
              {isWatchingInLounge ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Playing In Lounge: {selectedTitle.title}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsWatchingInLounge(false)}
                      className="text-xs text-text-muted hover:text-text-primary underline"
                    >
                      Minimize Player
                    </button>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                    <VideoPlayer
                      tmdbId={selectedTitle.id}
                      mediaType={selectedTitle.type}
                      season={1}
                      episode={1}
                    />
                  </div>
                  <p className="text-[11px] text-text-muted text-center pt-1">
                    💡 Playback controls operate independently on your player. Chat, reactions, and selected stream titles are shared live with all lounge participants.
                  </p>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  {/* Poster */}
                  <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-xl bg-surface2">
                    {selectedTitle.posterPath ? (
                      <Image
                        src={tmdbImage(selectedTitle.posterPath, "w342") || ""}
                        alt={selectedTitle.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                        No Poster
                      </div>
                    )}
                  </div>

                  {/* Meta & Sync Play CTA */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/30 flex items-center gap-1.5">
                        <Radio size={12} className="animate-pulse" />
                        Shared Stream Room
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-secondary font-mono">{selectedTitle.year}</span>
                      <span className="text-text-muted">·</span>
                      <span className="uppercase text-[10px] font-bold text-accent">
                        {selectedTitle.type}
                      </span>
                      {selectedTitle.voteAverage ? (
                        <>
                          <span className="text-text-muted">·</span>
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Star size={11} fill="currentColor" />
                            {selectedTitle.voteAverage.toFixed(1)}
                          </span>
                        </>
                      ) : null}
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary leading-tight">
                      {selectedTitle.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Host and participants share synced timestamps. Watch together right in this lounge or launch the full theater view!
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => setIsWatchingInLounge(true)}
                        className={buttonVariants({
                          variant: "primary",
                          size: "lg",
                          className: "shadow-lg shadow-accent/25 active:scale-95",
                        })}
                      >
                        <Play size={16} fill="currentColor" />
                        Watch In Lounge
                      </button>

                      {theaterHref && (
                        <Link
                          href={theaterHref}
                          className={buttonVariants({
                            variant: "outline",
                            size: "lg",
                            className: "active:scale-95",
                          })}
                        >
                          <Maximize2 size={15} />
                          Fullscreen Theater
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STREAM SEARCH & TITLE SELECTION SECTION */}
          <div
            className="rounded-3xl border border-border p-5 sm:p-6 space-y-5"
            style={{ background: "var(--bg-surface)" }}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Choose What To Stream Together
                </h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Search ANY movie or series across TMDB to stream with your friends in real-time.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies & TV shows... (e.g. Interstellar, Breaking Bad, Batman, Parasite)"
                className="w-full rounded-2xl border border-border bg-surface2 py-3 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown/Rail */}
            {searchQuery.trim() && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {isSearching ? "Searching TMDB..." : `Search Results (${searchResults.length})`}
                </p>

                {searchResults.length === 0 && !isSearching && (
                  <p className="text-xs text-text-muted py-2">
                    No results found for &ldquo;{searchQuery}&rdquo;. Try another title.
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {searchResults.map((item) => {
                    const isCurrent = selectedTitle?.id === item.id;
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelectTitle(item)}
                        className={`flex flex-col text-left rounded-2xl border p-2 transition ${
                          isCurrent
                            ? "border-accent bg-accent/15 ring-2 ring-accent"
                            : "border-border bg-surface2 hover:border-accent/60"
                        }`}
                      >
                        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-surface mb-2">
                          {item.posterPath ? (
                            <Image
                              src={tmdbImage(item.posterPath, "w185") || ""}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-text-muted">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="truncate text-xs font-bold text-text-primary">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 flex items-center justify-between">
                          <span>{item.year || "—"}</span>
                          <span className="uppercase text-[9px] font-bold text-accent">
                            {item.type}
                          </span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trending & Popular Browser Tabs */}
            {!searchQuery.trim() && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <button
                    onClick={() => setPopularTab("movie")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      popularTab === "movie"
                        ? "bg-accent text-[var(--on-accent)] shadow"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Film size={13} />
                    Popular Movies
                  </button>
                  <button
                    onClick={() => setPopularTab("tv")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      popularTab === "tv"
                        ? "bg-accent text-[var(--on-accent)] shadow"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Tv size={13} />
                    Popular TV Shows
                  </button>
                </div>

                {/* Popular Horizontal Rail */}
                <div className="rail flex gap-3 overflow-x-auto pb-2">
                  {popularItems.map((item) => {
                    const isCurrent = selectedTitle?.id === item.id;
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelectTitle(item)}
                        className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left shrink-0 transition ${
                          isCurrent
                            ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                            : "border-border bg-surface2 hover:border-border-hover"
                        }`}
                      >
                        <div className="relative aspect-[2/3] w-12 rounded-xl overflow-hidden bg-surface shrink-0">
                          {item.posterPath ? (
                            <Image
                              src={tmdbImage(item.posterPath, "w185") || ""}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-surface" />
                          )}
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-xs font-bold text-text-primary max-w-[120px]">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {item.year} · {item.type.toUpperCase()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Reaction Floating Bar */}
          <div
            className="rounded-2xl border border-border p-4 flex items-center justify-between gap-2"
            style={{ background: "var(--bg-surface)" }}
          >
            <span className="text-xs font-bold text-text-muted shrink-0 hidden sm:inline">
              React in Room:
            </span>
            <div className="flex items-center justify-around flex-1 gap-1">
              {["🍿", "🔥", "😱", "👏", "😂", "❤️"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => triggerReaction(emoji)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface2 hover:scale-125 active:scale-95 text-xl transition-all shadow-sm"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Real-time Participants & Live Room Chat */}
        <div className="space-y-4">
          {/* Active in Room Panel */}
          <div
            className="rounded-2xl border border-border p-4 space-y-3"
            style={{ background: "var(--bg-surface)" }}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  In This Room ({participants.length})
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* List of actual connected users */}
            <div className="space-y-2">
              {participants.map((p) => {
                const isMe = p.id === myUserId;
                return (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span
                        className={`font-semibold ${
                          isMe ? "text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        {p.name} {isMe && "(You)"} {p.isHost && "(Host)"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {p.status}
                    </span>
                  </div>
                );
              })}

              {/* Empty state invitation if user is alone */}
              {participants.length <= 1 && (
                <div className="mt-3 rounded-xl border border-dashed border-border bg-surface2/50 p-3 text-center space-y-2">
                  <UserPlus size={18} className="mx-auto text-accent" />
                  <p className="text-[11px] text-text-secondary leading-snug">
                    No friends have joined yet. Share code{" "}
                    <span className="font-mono font-bold text-accent">#{code}</span> to
                    stream together!
                  </p>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-[11px] font-bold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <Share2 size={11} />
                    Copy Invite Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Chat Box */}
          <div
            className="rounded-2xl border border-border flex flex-col h-[400px] overflow-hidden"
            style={{ background: "var(--bg-surface)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <MessageSquare size={14} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Party Chat
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-2.5 text-xs">
                  <span className="text-sm mt-0.5">{m.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-text-primary truncate">{m.sender}</span>
                      <span className="text-[10px] text-text-muted">{m.time}</span>
                    </div>
                    <p className="text-text-secondary mt-0.5 leading-relaxed break-words">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something to the room..."
                className="flex-1 rounded-xl border border-border bg-surface2 px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-[var(--on-accent)] font-bold transition hover:opacity-90 disabled:opacity-40"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Emoji Bursts */}
      {floatingEmojis.map((f) => (
        <div
          key={f.id}
          className="fixed pointer-events-none z-[10000] text-3xl"
          style={{
            left: `${f.left}%`,
            bottom: "80px",
            animation: "burst 1.8s ease-out forwards",
          }}
        >
          {f.emoji}
        </div>
      ))}

      <style jsx global>{`
        @keyframes burst {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translateY(-220px) scale(1.6);
          }
        }
      `}</style>
    </main>
  );
}
