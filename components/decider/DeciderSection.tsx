"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Star, Film, Tv, Play, BookmarkPlus, RefreshCw } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";
import { buttonVariants } from "@/components/ui/Button";

interface DeciderItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: "movie" | "tv";
  moods?: string[];
}

const MOOD_CHIPS: Record<string, string[]> = {
  "The Dark Knight": ["epic", "action", "iconic"],
  "Inception": ["mind-bending", "sci-fi", "thriller"],
  "Parasite": ["drama", "dark comedy", "twist"],
  "Everything Everywhere All at Once": ["funny", "emotional", "mind-bending"],
  "Dune: Part Two": ["epic", "sci-fi", "adventure"],
  "Oppenheimer": ["drama", "historical", "intense"],
  "Mad Max: Fury Road": ["action", "post-apocalyptic", "adrenaline"],
  "Interstellar": ["sci-fi", "emotional", "mind-bending"],
};

function getDefaultMoods(title: string): string[] {
  return MOOD_CHIPS[title] ?? ["cinema", "acclaimed", "must-watch"];
}

// Static curated decider pools (used as seed until TMDB data loads)
const MOVIE_SEEDS: DeciderItem[] = [
  { id: 27205, title: "Inception", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop_path: null, vote_average: 8.8, release_date: "2010", overview: "A thief who enters the dreams of others.", media_type: "movie" },
  { id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: null, vote_average: 9.0, release_date: "2008", overview: "Batman faces The Joker in Gotham City.", media_type: "movie" },
  { id: 872585, title: "Oppenheimer", poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_path: null, vote_average: 8.3, release_date: "2023", overview: "The story of J. Robert Oppenheimer.", media_type: "movie" },
  { id: 693134, title: "Dune: Part Two", poster_path: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg", backdrop_path: null, vote_average: 8.3, release_date: "2024", overview: "Paul Atreides leads the Fremen.", media_type: "movie" },
  { id: 496243, title: "Parasite", poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdrop_path: null, vote_average: 8.5, release_date: "2019", overview: "Class conflict in Seoul.", media_type: "movie" },
  { id: 157336, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: null, vote_average: 8.6, release_date: "2014", overview: "Astronauts traverse a wormhole.", media_type: "movie" },
  { id: 76341, title: "Mad Max: Fury Road", poster_path: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", backdrop_path: null, vote_average: 7.8, release_date: "2015", overview: "A post-apocalyptic world.", media_type: "movie" },
  { id: 545611, title: "Everything Everywhere All at Once", poster_path: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", backdrop_path: null, vote_average: 7.8, release_date: "2022", overview: "A laundromat owner saves the multiverse.", media_type: "movie" },
];

const TV_SEEDS: DeciderItem[] = [
  { id: 1396, name: "Breaking Bad", poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", backdrop_path: null, vote_average: 9.5, first_air_date: "2008", overview: "A chemistry teacher becomes a drug kingpin.", media_type: "tv" },
  { id: 1399, name: "Game of Thrones", poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", backdrop_path: null, vote_average: 8.4, first_air_date: "2011", overview: "Noble families battle for the Iron Throne.", media_type: "tv" },
  { id: 66732, name: "Stranger Things", poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", backdrop_path: null, vote_average: 8.6, first_air_date: "2016", overview: "Supernatural mysteries in Hawkins, Indiana.", media_type: "tv" },
  { id: 60625, name: "Rick and Morty", poster_path: "/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg", backdrop_path: null, vote_average: 8.7, first_air_date: "2013", overview: "An eccentric scientist and his grandson.", media_type: "tv" },
  { id: 94997, name: "House of the Dragon", poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg", backdrop_path: null, vote_average: 8.4, first_air_date: "2022", overview: "The reign of House Targaryen.", media_type: "tv" },
  { id: 87108, name: "Chernobyl", poster_path: "/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg", backdrop_path: null, vote_average: 9.4, first_air_date: "2019", overview: "The true story of the Chernobyl disaster.", media_type: "tv" },
];

type SwipeAction = "like" | "skip" | "dislike";
type Stage = "idle" | "swiping" | "done";

interface PerfectPick {
  item: DeciderItem;
  mediaType: "movie" | "tv";
}

export function DeciderSection() {
  const [mode, setMode] = useState<"movie" | "tv">("movie");
  const [stage, setStage] = useState<Stage>("idle");
  const [deck, setDeck] = useState<DeciderItem[]>([]);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(0);
  const [perfectPick, setPerfectPick] = useState<PerfectPick | null>(null);
  const [isSwipingOut, setIsSwipingOut] = useState(false);

  // Motion values for the top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);

  const currentItem = deck[index];
  const remaining = deck.length - index;

  // Seed deck when mode changes
  useEffect(() => {
    const seeds = mode === "movie" ? MOVIE_SEEDS : TV_SEEDS;
    setDeck([...seeds].sort(() => Math.random() - 0.5));
    setIndex(0);
    setSaved(0);
    setPerfectPick(null);
    setIsSwipingOut(false);
  }, [mode]);

  const advance = useCallback(
    (action: SwipeAction) => {
      if (!currentItem) return;
      if (action === "like") {
        setSaved((s) => s + 1);
        // 90%+ "liked" items trigger perfect pick reveal
        if (currentItem.vote_average >= 8.0) {
          setPerfectPick({ item: currentItem, mediaType: mode });
          setStage("done");
          return;
        }
      }
      const nextIndex = index + 1;
      if (nextIndex >= deck.length) {
        // Reveal best remaining pick
        const bestLiked = deck.slice(0, index + 1).sort((a, b) => b.vote_average - a.vote_average)[0];
        if (bestLiked) setPerfectPick({ item: bestLiked, mediaType: mode });
        setStage("done");
      } else {
        setIndex(nextIndex);
        x.set(0);
      }
    },
    [currentItem, index, deck, mode, x]
  );

  const triggerSwipe = useCallback(
    (action: SwipeAction, initialVelocity = 0) => {
      if (!currentItem || isSwipingOut) return;
      setIsSwipingOut(true);

      if (action === "like") {
        const vel = Math.max(initialVelocity, 500);
        animate(x, 500, {
          type: "spring",
          stiffness: 280,
          damping: 25,
          velocity: vel,
          onComplete: () => {
            advance("like");
            x.set(0);
            setIsSwipingOut(false);
          },
        });
      } else if (action === "dislike") {
        const vel = Math.min(initialVelocity, -500);
        animate(x, -500, {
          type: "spring",
          stiffness: 280,
          damping: 25,
          velocity: vel,
          onComplete: () => {
            advance("dislike");
            x.set(0);
            setIsSwipingOut(false);
          },
        });
      } else {
        // Skip
        advance("skip");
        x.set(0);
        setIsSwipingOut(false);
      }
    },
    [currentItem, isSwipingOut, advance, x]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 90;
      if (info.offset.x > threshold || info.velocity.x > 450) {
        triggerSwipe("like", info.velocity.x);
      } else if (info.offset.x < -threshold || info.velocity.x < -450) {
        triggerSwipe("dislike", info.velocity.x);
      } else {
        // Restoring spring inertia
        animate(x, 0, {
          type: "spring",
          stiffness: 320,
          damping: 26,
          velocity: info.velocity.x,
        });
      }
    },
    [triggerSwipe, x]
  );

  useEffect(() => {
    if (stage !== "swiping") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") triggerSwipe("like");
      else if (e.key === "ArrowLeft") triggerSwipe("dislike");
      else if (e.key === " ") { e.preventDefault(); triggerSwipe("skip"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage, triggerSwipe]);

  const title = currentItem?.title ?? currentItem?.name ?? "";
  const moods = getDefaultMoods(title);
  const year = currentItem?.release_date?.split("-")[0] ?? currentItem?.first_air_date?.split("-")[0];
  const poster = currentItem ? tmdbImage(currentItem.poster_path, "w342") : null;
  const mediaType = mode;

  const playHref =
    perfectPick?.mediaType === "tv"
      ? `/watch/tv/${perfectPick.item.id}/1/1`
      : `/watch/movie/${perfectPick?.item.id}`;
  const detailHref = perfectPick
    ? `/${perfectPick.mediaType}/${perfectPick.item.id}`
    : "#";
  const pickPoster = perfectPick ? tmdbImage(perfectPick.item.poster_path, "w342") : null;
  const pickTitle = perfectPick?.item.title ?? perfectPick?.item.name ?? "";
  const pickYear =
    perfectPick?.item.release_date?.split("-")[0] ??
    perfectPick?.item.first_air_date?.split("-")[0];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-1">
            — THE DECIDER
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-text-primary leading-tight">
            Can&apos;t decide?{" "}
            <em className="not-italic text-accent">Let us.</em>
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Swipe through titles — we&apos;ll find your perfect pick.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-0 rounded-xl border border-border bg-surface p-1 w-fit self-start sm:self-auto shrink-0">
          {(["movie", "tv"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setStage("idle"); }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                mode === m
                  ? "bg-accent text-[var(--on-accent)] shadow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {m === "movie" ? <Film size={14} /> : <Tv size={14} />}
              {m === "movie" ? "Movies" : "TV Shows"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col lg:flex-row items-center gap-8"
          >
            {/* Stacked card visual */}
            <div className="relative w-full max-w-[260px] flex-shrink-0 mx-auto lg:mx-0">
              {[2, 1, 0].map((offset) => (
                <div
                  key={offset}
                  className="absolute inset-0 rounded-2xl bg-surface border border-border"
                  style={{
                    transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.04})`,
                    zIndex: 3 - offset,
                    opacity: 1 - offset * 0.25,
                  }}
                />
              ))}
              <div
                className="relative rounded-2xl bg-surface border border-border overflow-hidden aspect-[2/3] w-full"
                style={{ zIndex: 4 }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="text-5xl">🎬</div>
                  <p className="font-display font-bold text-text-primary text-lg leading-tight">
                    Start to reveal your pick
                  </p>
                  <p className="text-xs text-text-muted">
                    {deck.length} titles ready for you
                  </p>
                </div>
              </div>
            </div>

            {/* Start CTA */}
            <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-text-muted space-y-1">
                  <p>👎 Swipe left — <em className="text-text-secondary not-italic">not for me</em></p>
                  <p>💖 Swipe right — <em className="text-text-secondary not-italic">loved it</em></p>
                  <p>👁️ Tap skip — <em className="text-text-secondary not-italic">haven&apos;t seen</em></p>
                </div>
              </div>
              <button
                onClick={() => setStage("swiping")}
                className={buttonVariants({ variant: "primary", size: "lg", className: "gap-2" })}
              >
                <Play size={16} fill="currentColor" />
                ▶ Start The Decider
              </button>
            </div>
          </motion.div>
        )}

        {stage === "swiping" && currentItem && (
          <motion.div
            key="swiping"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Stats bar */}
            <div className="w-full order-2 lg:order-1 lg:w-56 flex-shrink-0">
              {/* Progress dots */}
              <div className="flex flex-wrap gap-1 mb-6">
                {deck.slice(0, Math.min(deck.length, 10)).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < index
                        ? "bg-accent"
                        : i === index
                        ? "bg-accent/60 w-6"
                        : "bg-border"
                    } ${i === index ? "w-6" : "w-3"}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                {[
                  { label: "Remaining", value: remaining },
                  { label: "Saved", value: saved },
                  { label: "Perfect Pick", value: "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-surface border border-border p-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-2xl font-black text-text-primary mt-1 font-display">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card + Controls */}
            <div className="flex-1 order-1 lg:order-2 flex flex-col items-center gap-6">
              {/* Card Stack */}
              <div className="relative h-[380px] sm:h-[440px] w-full max-w-[300px] mx-auto select-none">
                {/* Background hint cards */}
                {deck.slice(index + 1, index + 3).reverse().map((card, idx) => {
                  const posterBg = tmdbImage(card.poster_path, "w342");
                  return (
                    <div
                      key={card.id}
                      className="absolute inset-0 rounded-2xl overflow-hidden border border-border"
                      style={{
                        transform: `translateY(${(idx + 1) * 8}px) scale(${1 - (idx + 1) * 0.04})`,
                        zIndex: 2 - idx,
                      }}
                    >
                      {posterBg && <img src={posterBg} alt="" className="w-full h-full object-cover opacity-50" />}
                    </div>
                  );
                })}

                {/* Swipeable top card */}
                <motion.div
                  key={currentItem.id}
                  drag={isSwipingOut ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.65}
                  dragTransition={{ bounceStiffness: 320, bounceDamping: 26, power: 0.25 }}
                  onDragEnd={handleDragEnd}
                  style={{ x, rotate, zIndex: 10 }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden border border-border shadow-2xl touch-none"
                  whileTap={{ scale: 1.02 }}
                >
                  {poster && (
                    <Image src={poster} alt={title} fill className="object-cover" sizes="300px" />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Like indicator */}
                  <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-6 left-6 rounded-xl border-2 border-green-400 px-3 py-1.5 backdrop-blur-sm bg-black/40"
                  >
                    <span className="text-green-400 font-black text-sm tracking-wide">LOVED IT 💖</span>
                  </motion.div>

                  {/* Nope indicator */}
                  <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute top-6 right-6 rounded-xl border-2 border-red-400 px-3 py-1.5 backdrop-blur-sm bg-black/40"
                  >
                    <span className="text-red-400 font-black text-sm tracking-wide">NOPE 👎</span>
                  </motion.div>

                  {/* Card content */}
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Star size={12} fill="currentColor" className="text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">
                        {currentItem.vote_average.toFixed(1)}
                      </span>
                      {year && <span className="text-xs text-white/60">{year}</span>}
                    </div>
                    <p className="text-white font-display font-black text-xl leading-tight">{title}</p>
                    <div className="flex flex-wrap gap-1">
                      {moods.map((mood) => (
                        <span key={mood} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => triggerSwipe("dislike")}
                  disabled={isSwipingOut}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400/40 bg-surface text-2xl transition-all hover:border-red-400 hover:bg-red-400/10 active:scale-90 disabled:opacity-50"
                  aria-label="Not for me"
                  title="Not for me (← Arrow)"
                >
                  👎
                </button>
                <button
                  onClick={() => triggerSwipe("skip")}
                  disabled={isSwipingOut}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-lg transition-all hover:border-border-hover hover:bg-surface2 active:scale-90 disabled:opacity-50"
                  aria-label="Haven't seen it"
                  title="Haven't seen it (Space)"
                >
                  👁️
                </button>
                <button
                  onClick={() => triggerSwipe("like")}
                  disabled={isSwipingOut}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-400/40 bg-surface text-2xl transition-all hover:border-green-400 hover:bg-green-400/10 active:scale-90 disabled:opacity-50"
                  aria-label="Loved it"
                  title="Loved it (→ Arrow)"
                >
                  💖
                </button>
              </div>

              {/* Desktop hint */}
              <p className="hidden md:block text-[11px] text-text-muted/50 tracking-wide">
                ← not for me · space = haven&apos;t seen · loved it →
              </p>
            </div>
          </motion.div>
        )}

        {stage === "done" && perfectPick && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
          >
            {/* Poster */}
            {pickPoster && (
              <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shrink-0 ring-2 ring-accent/40">
                <Image src={pickPoster} alt={pickTitle} fill className="object-cover" sizes="224px" />
              </div>
            )}

            {/* Pick details */}
            <div className="flex flex-col gap-4 text-center lg:text-left max-w-lg">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">
                ✨ Your Perfect Pick
              </p>
              <h3 className="font-display text-3xl sm:text-4xl font-black text-text-primary leading-tight">
                {pickTitle}
              </h3>
              <div className="flex items-center gap-3 justify-center lg:justify-start text-sm text-text-muted">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={13} fill="currentColor" />
                  {perfectPick.item.vote_average.toFixed(1)}
                </span>
                {pickYear && <><span className="opacity-40">·</span><span>{pickYear}</span></>}
                <span className="opacity-40">·</span>
                <span className="capitalize">{perfectPick.mediaType === "tv" ? "TV Series" : "Film"}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                {perfectPick.item.overview}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  href={playHref}
                  className={buttonVariants({ variant: "primary", size: "lg", className: "gap-2" })}
                >
                  <Play size={15} fill="currentColor" />
                  Play Now
                </Link>
                <Link
                  href={detailHref}
                  className={buttonVariants({ variant: "secondary", size: "lg", className: "gap-2" })}
                >
                  More Info
                </Link>
                <button
                  onClick={() => { setStage("idle"); setSaved(0); setPerfectPick(null); }}
                  className={buttonVariants({ variant: "ghost", size: "lg", className: "gap-2" })}
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
