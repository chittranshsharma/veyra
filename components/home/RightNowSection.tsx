"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles, Star, Film, Flame } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";

interface EditorialPick {
  id: string;
  category: "Movie" | "Series";
  mediaTitle: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  tmdbId: number;
  year: string;
  rating: number;
  highlightBadge: string;
  curatorNote: string;
}

interface TrendingItem {
  rank: number;
  title: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  posterPath: string | null;
  backdropPath: string | null;
  badge: string;
  rating: number;
  year: string;
}

const EDITORIAL_PICKS: EditorialPick[] = [
  {
    id: "1",
    category: "Series",
    mediaTitle: "House of the Dragon",
    mediaType: "tv",
    posterPath: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    tmdbId: 94997,
    year: "2022",
    rating: 8.4,
    highlightBadge: "Epic Fantasy",
    curatorNote: "Targaryen civil war unfolds with staggering production scale.",
  },
  {
    id: "2",
    category: "Movie",
    mediaTitle: "Dune: Part Two",
    mediaType: "movie",
    posterPath: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
    tmdbId: 693134,
    year: "2024",
    rating: 8.2,
    highlightBadge: "Sci-Fi Milestone",
    curatorNote: "Villeneuve's sweeping desert epic redefined modern cinematic spectacle.",
  },
  {
    id: "3",
    category: "Movie",
    mediaTitle: "Oppenheimer",
    mediaType: "movie",
    posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    tmdbId: 872585,
    year: "2023",
    rating: 8.1,
    highlightBadge: "Masterpiece",
    curatorNote: "Nolan's tension-coiled biopic with unforgettable practical sound design.",
  },
  {
    id: "4",
    category: "Series",
    mediaTitle: "Stranger Things",
    mediaType: "tv",
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    tmdbId: 66732,
    year: "2016",
    rating: 8.6,
    highlightBadge: "80s Nostalgia",
    curatorNote: "The quintessential retro sci-fi mystery blending horror and camaraderie.",
  },
  {
    id: "5",
    category: "Movie",
    mediaTitle: "Interstellar",
    mediaType: "movie",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    tmdbId: 157336,
    year: "2014",
    rating: 8.4,
    highlightBadge: "Time Dilation",
    curatorNote: "Raw emotional odyssey across theoretical physics and the expanse of space.",
  },
];

const TRENDING_THIS_WEEK: TrendingItem[] = [
  {
    rank: 1,
    title: "Dune: Part Two",
    mediaType: "movie",
    tmdbId: 693134,
    posterPath: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    badge: "Most Discussed",
    rating: 8.2,
    year: "2024",
  },
  {
    rank: 2,
    title: "Oppenheimer",
    mediaType: "movie",
    tmdbId: 872585,
    posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdropPath: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    badge: "Award Winner",
    rating: 8.1,
    year: "2023",
  },
  {
    rank: 3,
    title: "House of the Dragon",
    mediaType: "tv",
    tmdbId: 94997,
    posterPath: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    backdropPath: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    badge: "Top Streamed",
    rating: 8.4,
    year: "2022",
  },
  {
    rank: 4,
    title: "Stranger Things",
    mediaType: "tv",
    tmdbId: 66732,
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropPath: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    badge: "Fan Favourite",
    rating: 8.6,
    year: "2016",
  },
];

export function RightNowSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-1 flex items-center gap-1.5">
          <Sparkles size={12} />
          EDITORIAL RADAR
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-black text-text-primary leading-tight">
          Cinema Spotlight
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Essential titles and landmark storytelling curated by the Veyra editorial desk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editorial Selection Stream */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                CURATED SELECTION
              </span>
            </div>
            <span className="rounded-full bg-accent/10 border border-accent/25 px-2.5 py-0.5 text-[10px] font-bold text-accent">
              WEEKLY ROTATION
            </span>
          </div>

          <div className="space-y-3">
            {EDITORIAL_PICKS.map((item) => {
              const thumb = tmdbImage(item.posterPath, "w92");
              const href = `/${item.mediaType}/${item.tmdbId}`;
              return (
                <div key={item.id} className="flex items-center gap-3 group p-2 rounded-xl hover:bg-surface2/60 transition">
                  {thumb ? (
                    <div className="relative h-14 w-10 shrink-0 rounded-lg overflow-hidden border border-border shadow-sm">
                      <Image src={thumb} alt={item.mediaTitle} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="h-14 w-10 shrink-0 rounded-lg bg-surface2 border border-border flex items-center justify-center">
                      <Film size={16} className="text-text-muted" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.2 rounded">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-text-muted">· {item.year}</span>
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 ml-auto">
                        <Star size={10} fill="currentColor" />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <Link href={href} className="text-sm font-bold text-text-primary hover:text-accent transition truncate block">
                      {item.mediaTitle}
                    </Link>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {item.curatorNote}
                    </p>
                  </div>

                  <Link
                    href={`/watch/${item.mediaType}/${item.tmdbId}${item.mediaType === "tv" ? "/1/1" : ""}`}
                    className="shrink-0 h-8 w-8 rounded-lg bg-surface2 border border-border hover:border-accent hover:text-accent flex items-center justify-center transition active:scale-95"
                    title={`Watch ${item.mediaTitle}`}
                  >
                    <Play size={13} fill="currentColor" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Trending Cinema This Week */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                TRENDING THIS WEEK
              </span>
            </div>
            <span className="rounded-full bg-surface2 border border-border px-2.5 py-0.5 text-[10px] font-semibold text-text-muted">
              GLOBAL POPULARITY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRENDING_THIS_WEEK.map((item) => {
              const bg = tmdbImage(item.backdropPath || item.posterPath, "w780");
              const watchHref = `/watch/${item.mediaType}/${item.tmdbId}${item.mediaType === "tv" ? "/1/1" : ""}`;

              return (
                <div
                  key={item.tmdbId}
                  className="relative group overflow-hidden rounded-xl border border-border bg-surface2 aspect-[16/10] flex flex-col justify-end p-3.5"
                >
                  {bg && (
                    <Image
                      src={bg}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-75"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-accent bg-background/80 px-2 py-0.5 rounded backdrop-blur-sm border border-border">
                        #{item.rank} {item.badge}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-background/80 px-1.5 py-0.5 rounded border border-border">
                        <Star size={10} fill="currentColor" />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-accent transition">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-text-muted font-mono">{item.year} · {item.mediaType.toUpperCase()}</span>
                      <Link
                        href={watchHref}
                        className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                      >
                        <Play size={11} fill="currentColor" /> Play
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
