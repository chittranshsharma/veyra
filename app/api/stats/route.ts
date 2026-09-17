import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tmdb } from "@/lib/tmdb/client";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Genre id → name mapping (TMDB standard)
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
  // TV genres
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(user.id, "api");
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  // 1. Fetch all watch_progress for this user
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

  const completedMovies = allProgress.filter(p => p.media_type === "movie" && p.completed).length;
  const completedEpisodes = allProgress.filter(p => p.media_type === "tv" && p.completed).length;
  const totalCompleted = allProgress.filter(p => p.completed).length;

  // 3. Fetch user reviews for ratings
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("user_id", user.id);

  const allRatings = (reviews ?? []).map(r => r.rating).filter(Boolean);
  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((s: number, r: number) => s + r, 0) / allRatings.length
      : null;

  // 4. Batch-fetch TMDB details for watched items (deduplicated)
  const uniqueItems = Array.from(
    new Map(
      allProgress.map(p => [`${p.media_type}-${p.tmdb_id}`, { id: p.tmdb_id, media_type: p.media_type as "movie" | "tv" }])
    ).values()
  ).slice(0, 50); // cap to avoid too many API calls

  let tmdbDetails: { id: number; genres?: { id: number }[]; release_date?: string; first_air_date?: string; poster_path?: string | null; title?: string; name?: string }[] = [];
  try {
    tmdbDetails = await tmdb.batchDetails(uniqueItems);
  } catch {
    // If TMDB fetch fails, proceed without genre/decade data
  }

  // 5. Genre breakdown
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

  // 6. Decade breakdown
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

  // 7. Recent posters for the share card collage (top 8 completed)
  const recentPosters = tmdbDetails
    .filter(d => d.poster_path)
    .slice(0, 8)
    .map(d => ({
      id: d.id,
      title: d.title ?? d.name ?? "",
      poster_path: d.poster_path ?? null,
    }));

  return NextResponse.json({
    totalHours,
    totalMinutes,
    totalWatchedItems: allProgress.length,
    totalCompleted,
    completedMovies,
    completedEpisodes,
    avgRating,
    ratingCount: allRatings.length,
    topGenres,
    decadeBreakdown,
    moviesVsTV: {
      movies: allProgress.filter(p => p.media_type === "movie").length,
      tv: allProgress.filter(p => p.media_type === "tv").length,
    },
    recentPosters,
  });
}
