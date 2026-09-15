import Image from "next/image";
import Link from "next/link";
import { tmdb, tmdbImage } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { Row } from "@/components/movie/Row";
import { PosterCard } from "@/components/movie/PosterCard";
import { HomeAiBanner } from "@/components/ai/HomeAiBanner";
import { Play, Info, Sparkles, Film, Tv, Flame, Library, ArrowRight, Star } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [trending, popularMovies, popularTV] = await Promise.all([
    tmdb.trending("all", "week"),
    tmdb.popularMovies(),
    tmdb.popularTV(),
  ]);

  // Pick a random hero from top 5 trending items
  const heroIndex = Math.floor(Math.random() * 5);
  const hero = trending.results[heroIndex] ?? trending.results[0];
  const heroMediaType = hero?.media_type ?? "movie";
  const heroTitle = hero?.title ?? hero?.name ?? "";
  const backdrop = tmdbImage(hero?.backdrop_path, "original");
  const heroYear = hero?.release_date?.split("-")[0] ?? hero?.first_air_date?.split("-")[0];

  // Fetch continue watching for logged-in users
  let continueWatching: {
    tmdb_id: number;
    media_type: string;
    progress_percent: number;
    season?: number | null;
    episode?: number | null;
  }[] = [];

  if (user) {
    const { data } = await supabase
      .from("watch_progress")
      .select("tmdb_id, media_type, progress_percent, season, episode")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("last_watched_at", { ascending: false })
      .limit(12);
    continueWatching = data ?? [];
  }

  // Resolve continue-watching items (checking trending/popular first, then fetching directly)
  const candidatePool = [
    ...trending.results,
    ...popularMovies.results,
    ...popularTV.results,
  ];

  const missingFromPool: { id: number; media_type: "movie" | "tv" }[] = [];
  const initialResolved = continueWatching.map((cw) => {
    const found = candidatePool.find(
      (item) =>
        item.id === cw.tmdb_id &&
        (item.media_type ?? (item.title ? "movie" : "tv")) === cw.media_type
    );
    if (!found) {
      missingFromPool.push({
        id: cw.tmdb_id,
        media_type: cw.media_type as "movie" | "tv",
      });
    }
    return { cw, found };
  });

  const fetchedMissing =
    missingFromPool.length > 0
      ? await tmdb.batchDetails(missingFromPool)
      : [];

  const continueItems = initialResolved
    .map(({ cw, found }) => {
      const resolved =
        found ??
        fetchedMissing.find(
          (m) =>
            m.id === cw.tmdb_id &&
            (m.media_type ?? (m.title ? "movie" : "tv")) === cw.media_type
        );
      if (!resolved) return null;
      return {
        ...resolved,
        _progress: cw.progress_percent,
        _season: cw.season,
        _episode: cw.episode,
      };
    })
    .filter(Boolean) as (typeof candidatePool[0] & {
      _progress: number;
      _season?: number | null;
      _episode?: number | null;
    })[];

  // Optional admin-curated featured titles
  const { data: dbFeatured } = await supabase
    .from("featured_titles")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(12);

  const featuredItems = (dbFeatured ?? []).map((f) => ({
    id: f.tmdb_id,
    title: f.title ?? "Featured",
    name: f.title ?? "Featured",
    media_type: f.media_type as "movie" | "tv",
    poster_path: f.poster_path,
    backdrop_path: f.backdrop_path,
    overview: f.overview ?? "",
    vote_average: 8.5,
  }));

  // Fetch public collections for showcase
  const { data: publicCollections } = await supabase
    .from("collections")
    .select("id, name, description, created_at, collection_items(count)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero */}
      {hero && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          {backdrop && (
            <Image
              src={backdrop}
              alt={heroTitle}
              fill
              priority
              className="object-cover object-top hero-backdrop"
            />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />

          {/* Dynamic multi-color ambient glow */}
          <div className="ambient-glow" />

          <div className="absolute bottom-12 left-4 max-w-2xl space-y-4 sm:left-8 lg:left-16 z-10">
            {/* Feature badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent border border-accent/40 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                SPOTLIGHT
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
                4K Ultra HD
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
                HDR10+
              </span>
              {heroYear && (
                <span className="text-xs font-medium text-white/70">
                  {heroYear}
                </span>
              )}
              {hero.vote_average && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star size={12} fill="currentColor" />
                  {hero.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
              {heroTitle}
            </h1>

            <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base text-white/80">
              {hero.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={heroMediaType === "tv" ? `/watch/tv/${hero.id}/1/1` : `/watch/movie/${hero.id}`}
                className="btn-shimmer flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 font-bold text-background shadow-xl shadow-accent/25 transition hover:brightness-110 active:scale-95"
              >
                <Play size={18} fill="currentColor" />
                Play Now
              </Link>
              <Link
                href={`/${heroMediaType}/${hero.id}`}
                className="flex items-center gap-2.5 rounded-full bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-md border border-white/15 transition hover:bg-white/20 active:scale-95"
              >
                <Info size={18} />
                More Info
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick Category & Mood Bar */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8">
        <div className="rail flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent/15 px-4 py-2 text-xs font-bold text-accent border border-accent/30 shadow-sm"
          >
            <Flame size={14} />
            Trending
          </Link>
          <Link
            href="/movies"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2/60 px-4 py-2 text-xs font-medium text-white/80 border border-white/5 hover:border-accent/40 hover:text-white transition"
          >
            <Film size={14} />
            Movies
          </Link>
          <Link
            href="/tv"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2/60 px-4 py-2 text-xs font-medium text-white/80 border border-white/5 hover:border-accent/40 hover:text-white transition"
          >
            <Tv size={14} />
            TV Shows
          </Link>
          <Link
            href="/movies?genre=28"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2/60 px-4 py-2 text-xs font-medium text-white/80 border border-white/5 hover:border-accent/40 hover:text-white transition"
          >
            Action & Thrills
          </Link>
          <Link
            href="/movies?genre=878"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2/60 px-4 py-2 text-xs font-medium text-white/80 border border-white/5 hover:border-accent/40 hover:text-white transition"
          >
            Sci-Fi & Fantasy
          </Link>
          <Link
            href="/movies?genre=18"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2/60 px-4 py-2 text-xs font-medium text-white/80 border border-white/5 hover:border-accent/40 hover:text-white transition"
          >
            Drama
          </Link>
          <Link
            href="/collections"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface2/60 px-4 py-2 text-xs font-medium text-accent border border-accent/20 hover:border-accent/50 hover:text-white transition"
          >
            <Library size={14} />
            Curated Collections
          </Link>
        </div>
      </div>

      {/* Groq AI Vibe Matcher Banner */}
      <HomeAiBanner />

      <div className="mt-8 space-y-12">
        {/* Continue watching rail */}
        {continueItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="px-4 font-display text-xl font-semibold text-white sm:px-8">
              Continue Watching
            </h2>
            <div className="rail flex gap-3 overflow-x-auto px-4 pb-2 sm:px-8">
              {continueItems.map((item, i) => (
                <PosterCard
                  key={`cw-${item.id}`}
                  item={item}
                  progressPercent={item._progress}
                  season={item._season}
                  episode={item._episode}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Optional Featured row if configured by admin */}
        {featuredItems.length > 0 && (
          <Row title="Featured by Veyra" items={featuredItems as any} />
        )}

        {/* Trending This Week */}
        <Row title="Trending This Week" items={trending.results} />

        {/* Popular Movies */}
        <Row
          title="Popular Movies"
          items={popularMovies.results}
          defaultMediaType="movie"
        />

        {/* Curated Collections Spotlight Banner */}
        <section className="mx-4 sm:mx-8 rounded-2xl border border-white/10 bg-gradient-to-r from-surface via-surface2/70 to-surface p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <Sparkles size={13} />
                Letterboxd-Style Lists
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Discover & Create Custom Collections
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Organize your favorite cinema into themed playlists, rank franchise marathons, or explore lists curated by the Veyra community.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/collections"
                className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-background hover:brightness-110 transition"
              >
                Browse Collections
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/collections/new"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition border border-white/10"
              >
                + Create List
              </Link>
            </div>
          </div>
        </section>

        {/* Popular TV Shows */}
        <Row
          title="Popular TV Shows"
          items={popularTV.results}
          defaultMediaType="tv"
        />
      </div>
    </main>
  );
}
