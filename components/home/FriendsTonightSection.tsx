"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, Bookmark, Sparkles, Play, Library, Plus } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";
import { buttonVariants } from "@/components/ui/Button";

interface CuratorSelection {
  id: string;
  theme: string;
  mediaTitle: string;
  mediaYear: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  posterPath: string | null;
  curatorTag: string;
  recommendationReason: string;
}

const CURATOR_SELECTIONS: CuratorSelection[] = [
  {
    id: "1",
    theme: "Emotional Precision",
    mediaTitle: "Aftersun",
    mediaYear: "2022",
    mediaType: "movie",
    tmdbId: 791428,
    posterPath: "/9yBVqNruk6Ykrwc32qkE2IqDuwh.jpg",
    curatorTag: "Indie Essential",
    recommendationReason: "A heartbreakingly tender exploration of memory, fatherhood, and grief.",
  },
  {
    id: "2",
    theme: "Scale & Vision",
    mediaTitle: "Dune: Part Two",
    mediaYear: "2024",
    mediaType: "movie",
    tmdbId: 693134,
    posterPath: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
    curatorTag: "Sci-Fi Triumph",
    recommendationReason: "Immersive sound, staggering desert photography, and mythical weight.",
  },
  {
    id: "3",
    theme: "Retro Mystery",
    mediaTitle: "Stranger Things",
    mediaYear: "2016",
    mediaType: "tv",
    tmdbId: 66732,
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    curatorTag: "Binge Worthy",
    recommendationReason: "Synthesizers, government secrets, and supernatural camaraderie.",
  },
  {
    id: "4",
    theme: "Moral Complexity",
    mediaTitle: "The Dark Knight",
    mediaYear: "2008",
    mediaType: "movie",
    tmdbId: 155,
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    curatorTag: "Masterpiece",
    recommendationReason: "Christopher Nolan's peak crime thriller featuring Heath Ledger's Joker.",
  },
  {
    id: "5",
    theme: "Historical Gravity",
    mediaTitle: "Oppenheimer",
    mediaYear: "2023",
    mediaType: "movie",
    tmdbId: 872585,
    posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    curatorTag: "Award Winner",
    recommendationReason: "The ethical terror of the nuclear dawn framed as an inescapable courtroom drama.",
  },
];

interface FriendsTonightSectionProps {
  isAuthenticated?: boolean;
}

export function FriendsTonightSection({ isAuthenticated = false }: FriendsTonightSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-1 flex items-center gap-1.5">
          <Sparkles size={12} />
          CURATED ESSENTIALS
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-black text-text-primary leading-tight">
          Cinephile Spotlight
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Remarkable films, character journeys, and cinematic discoveries selected for tonight
        </p>
      </div>

      {/* Horizontal Rail of Selections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {CURATOR_SELECTIONS.map((item) => {
          const poster = tmdbImage(item.posterPath, "w342");
          const watchHref = `/watch/${item.mediaType}/${item.tmdbId}${item.mediaType === "tv" ? "/1/1" : ""}`;
          const detailHref = `/${item.mediaType}/${item.tmdbId}`;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-3 flex flex-col justify-between space-y-3 group hover:border-accent/50 transition shadow-sm"
            >
              {/* Poster Thumbnail */}
              <Link href={detailHref} className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface2 block">
                {poster ? (
                  <Image
                    src={poster}
                    alt={item.mediaTitle}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                    No Poster
                  </div>
                )}
                <span className="absolute top-2 left-2 rounded-md bg-background/85 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-accent border border-border">
                  {item.curatorTag}
                </span>
              </Link>

              {/* Info */}
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  {item.theme}
                </p>
                <Link href={detailHref} className="font-display text-sm font-bold text-text-primary group-hover:text-accent transition truncate block">
                  {item.mediaTitle}
                </Link>
                <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                  {item.recommendationReason}
                </p>
              </div>

              {/* Action */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/50">
                <span className="text-[10px] font-mono text-text-muted">{item.mediaYear}</span>
                <Link
                  href={watchHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                >
                  <Play size={11} fill="currentColor" /> Watch
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Banner */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
            {isAuthenticated ? <Library size={18} /> : <LogIn size={18} />}
          </div>
          <div>
            <p className="font-display text-sm sm:text-base font-bold text-text-primary">
              {isAuthenticated
                ? "Your Personal Cinema Archive"
                : "Personalize Your Cinema Experience"}
            </p>
            <p className="text-xs text-text-muted">
              {isAuthenticated
                ? "Organize custom collections, track your completed watch history, and manage your watchlist."
                : "Sign in to sync your watch progress across devices, bookmark titles, and build curated collections."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                href="/watchlist"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <Bookmark size={13} />
                My Watchlist
              </Link>
              <Link
                href="/collections/new"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <Plus size={13} />
                New Collection
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              <LogIn size={13} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
