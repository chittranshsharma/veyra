import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { tmdb } from "@/lib/tmdb/client";
import { StatsShareCard } from "@/components/stats/StatsShareCard";
import { buttonVariants } from "@/components/ui/Button";
import {
  BarChart2,
  Clock,
  Film,
  Tv,
  Star,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  BookmarkCheck,
  Flame,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cinema Stats & Wrapped | Veyra",
  description: "Your personalized streaming stats, top genres, decades, and Cinema Wrapped card.",
};

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl min-h-[75vh] px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-xl">
          <BarChart2 size={32} className="text-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-text-primary">
          Your Cinema Wrapped
        </h1>
        <p className="mt-3 text-text-secondary max-w-md text-base leading-relaxed">
          Sign in to analyze your total streaming hours, top genres, decade preferences, and generate your custom Cinema Wrapped share card.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/auth/login?redirectTo=/stats"
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            Sign In to View Stats
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/explore"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Browse Cinema
          </Link>
        </div>
      </main>
    );
  }

  // 1. Fetch user watch progress
  const { data: progress } = await supabase
    .from("watch_progress")
    .select("tmdb_id, media_type, progress_seconds, duration_seconds, completed, last_watched_at")
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false });

  const allProgress = progress ?? [];

  // 2. Compute headline metrics
  const totalSeconds = allProgress.reduce((s, p) => s + (p.progress_seconds ?? 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

  const completedMovies = allProgress.filter((p) => p.media_type === "movie" && p.completed).length;
  const completedEpisodes = allProgress.filter((p) => p.media_type === "tv" && p.completed).length;
  const totalCompleted = allProgress.filter((p) => p.completed).length;

  const moviesCount = allProgress.filter((p) => p.media_type === "movie").length;
  const tvCount = allProgress.filter((p) => p.media_type === "tv").length;
  const totalMedia = moviesCount + tvCount;
  const moviePercent = totalMedia > 0 ? Math.round((moviesCount / totalMedia) * 100) : 50;
  const tvPercent = 100 - moviePercent;

  // 3. Fetch user ratings & reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("user_id", user.id);

  const allRatings = (reviews ?? []).map((r) => r.rating).filter(Boolean);
  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((s: number, r: number) => s + r, 0) / allRatings.length
      : null;

  // 4. Batch TMDB details
  const uniqueItems = Array.from(
    new Map(
      allProgress.map((p) => [
        `${p.media_type}-${p.tmdb_id}`,
        { id: p.tmdb_id, media_type: p.media_type as "movie" | "tv" },
      ])
    ).values()
  ).slice(0, 50);

  let tmdbDetails: {
    id: number;
    genres?: { id: number }[];
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
    title?: string;
    name?: string;
  }[] = [];

  if (uniqueItems.length > 0) {
    try {
      tmdbDetails = await tmdb.batchDetails(uniqueItems);
    } catch {
      // Graceful fallback
    }
  }

  // 5. Genre counts
  const genreCounts: Record<string, number> = {};
  for (const item of tmdbDetails) {
    for (const g of item.genres ?? []) {
      const name = GENRE_MAP[g.id] ?? "Other";
      genreCounts[name] = (genreCounts[name] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }));

  // 6. Decades
  const decadeCounts: Record<string, number> = {};
  for (const item of tmdbDetails) {
    const dateStr = item.release_date ?? item.first_air_date ?? "";
    const year = parseInt(dateStr.split("-")[0] ?? "0", 10);
    if (year >= 1900) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] ?? 0) + 1;
    }
  }
  const decadeBreakdown = Object.entries(decadeCounts)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([decade, count]) => ({ decade, count }));

  // 7. Recent posters
  const recentPosters = tmdbDetails
    .filter((d) => d.poster_path)
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      title: d.title ?? d.name ?? "",
      poster_path: d.poster_path ?? null,
    }));

  const maxGenreCount = topGenres[0]?.count ?? 1;

  return (
    <main className="mx-auto max-w-6xl min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-accent text-sm font-semibold tracking-wide uppercase mb-1">
            <Sparkles size={16} />
            <span>Personal Watch Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-text-primary">
            Cinema Wrapped & Stats
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            Live insights computed from your streaming history and reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/watchlist"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <BookmarkCheck size={16} />
            Watchlist
          </Link>
          <Link
            href="/explore"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <Film size={16} />
            Stream Next
          </Link>
        </div>
      </div>

      {allProgress.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-border bg-surface p-12 text-center my-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center mb-5">
            <Clock size={32} className="text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary font-display">
            No Watch History Recorded Yet
          </h2>
          <p className="mt-2 text-text-secondary text-sm max-w-md mx-auto">
            Once you start watching films or TV episodes on Veyra, your watch hours, favorite genres, decade distribution, and custom Cinema Wrapped card will appear here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/movies"
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              <Film size={16} />
              Start Watching Movies
            </Link>
            <Link
              href="/profile"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              Import Letterboxd Data
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Total Watch Time */}
            <div className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Stream Time</span>
                <Clock size={18} className="text-accent" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight">
                {totalHours}
                <span className="text-xl font-normal text-text-muted ml-1">h</span>{" "}
                {totalMinutes}
                <span className="text-xl font-normal text-text-muted ml-1">m</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                Across {allProgress.length} stream sessions
              </div>
            </div>

            {/* Completed Titles */}
            <div className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <Film size={18} className="text-accent" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight">
                {totalCompleted}
              </div>
              <div className="mt-2 text-xs text-text-secondary flex gap-2">
                <span>{completedMovies} movies</span>
                <span>•</span>
                <span>{completedEpisodes} episodes</span>
              </div>
            </div>

            {/* Average Rating */}
            <div className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Rating</span>
                <Star size={18} className="text-star" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight">
                {avgRating !== null ? avgRating.toFixed(1) : "—"}
                {avgRating !== null && (
                  <span className="text-xl font-normal text-text-muted ml-1">/ 10</span>
                )}
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                {allRatings.length > 0 ? `${allRatings.length} user reviews logged` : "No reviews yet"}
              </div>
            </div>

            {/* Top Genre */}
            <div className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Top Taste</span>
                <Flame size={18} className="text-accent" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-text-primary tracking-tight truncate">
                {topGenres[0]?.genre ?? "Diverse"}
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                {topGenres[0] ? `${topGenres[0].count} titles watched` : "Keep watching"}
              </div>
            </div>
          </div>

          {/* Share Card Hero Section */}
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary">
                  Downloadable Cinema Wrapped Card
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Exportable 1240×680 high-res card ready to share on Instagram, X, or Discord.
                </p>
              </div>
            </div>

            <StatsShareCard
              totalHours={totalHours}
              totalMinutes={totalMinutes}
              completedMovies={completedMovies}
              completedEpisodes={completedEpisodes}
              avgRating={avgRating}
              topGenres={topGenres}
              recentPosters={recentPosters}
            />
          </div>

          {/* Deep Dives: Genres, Decades, Movies vs TV */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Genre Breakdown */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-sm font-bold font-display text-text-primary mb-4">
                <Layers size={18} className="text-accent" />
                <span>Top Genres</span>
              </div>
              {topGenres.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">No genre data available yet</p>
              ) : (
                <div className="space-y-3.5">
                  {topGenres.map((g) => {
                    const pct = Math.round((g.count / maxGenreCount) * 100);
                    return (
                      <div key={g.genre} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-text-primary">{g.genre}</span>
                          <span className="text-text-muted">{g.count} titles</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Movies vs TV Distribution */}
            <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold font-display text-text-primary mb-4">
                  <Film size={18} className="text-accent" />
                  <span>Movies vs TV</span>
                </div>

                <div className="my-4">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1.5 text-text-primary">
                      <Film size={14} className="text-accent" />
                      Movies ({moviePercent}%)
                    </span>
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <Tv size={14} className="text-text-muted" />
                      TV ({tvPercent}%)
                    </span>
                  </div>

                  {/* Dual split bar */}
                  <div className="h-3 w-full rounded-full bg-surface2 overflow-hidden flex">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${moviePercent}%` }}
                    />
                    <div
                      className="h-full bg-text-muted/40 transition-all duration-500"
                      style={{ width: `${tvPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-xl border border-border bg-surface2 p-3 text-center">
                    <span className="text-[11px] text-text-muted block">Movies Logged</span>
                    <span className="text-xl font-bold font-display text-text-primary">
                      {moviesCount}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border bg-surface2 p-3 text-center">
                    <span className="text-[11px] text-text-muted block">TV Series</span>
                    <span className="text-xl font-bold font-display text-text-primary">
                      {tvCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 text-[11px] text-text-muted">
                Calculated from all active viewing sessions.
              </div>
            </div>

            {/* Decades Distribution */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-sm font-bold font-display text-text-primary mb-4">
                <Calendar size={18} className="text-accent" />
                <span>Era / Decades</span>
              </div>
              {decadeBreakdown.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">No era data available yet</p>
              ) : (
                <div className="space-y-3">
                  {decadeBreakdown.map((d) => (
                    <div key={d.decade} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                      <span className="font-semibold text-text-primary">{d.decade}</span>
                      <span className="rounded-md bg-surface2 px-2 py-0.5 font-mono text-[11px] text-text-secondary">
                        {d.count} watched
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
