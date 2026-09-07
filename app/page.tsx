import Image from "next/image";
import Link from "next/link";
import { tmdb, tmdbImage } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { Row } from "@/components/movie/Row";
import { PosterCard } from "@/components/movie/PosterCard";
import { Play, Info } from "lucide-react";

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

  // Fetch continue watching for logged-in users
  let continueWatching: {
    tmdb_id: number;
    media_type: string;
    progress_percent: number;
  }[] = [];

  if (user) {
    const { data } = await supabase
      .from("watch_progress")
      .select("tmdb_id, media_type, progress_percent")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("last_watched_at", { ascending: false })
      .limit(10);
    continueWatching = data ?? [];
  }

  // Map continue-watching IDs to trending items (simple approach for MVP)
  const continueItems = continueWatching
    .map((cw) => {
      const found = [
        ...trending.results,
        ...popularMovies.results,
        ...popularTV.results,
      ].find(
        (item) =>
          item.id === cw.tmdb_id &&
          (item.media_type ?? (item.title ? "movie" : "tv")) === cw.media_type
      );
      return found ? { ...found, _progress: cw.progress_percent } : null;
    })
    .filter(Boolean) as (typeof trending.results[0] & { _progress: number })[];

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

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Hero */}
      {hero && (
        <section className="relative h-[75vh] w-full overflow-hidden">
          {backdrop && (
            <Image
              src={backdrop}
              alt={heroTitle}
              fill
              priority
              className="object-cover object-top"
            />
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          <div className="absolute bottom-12 left-4 max-w-2xl space-y-4 sm:left-8 lg:left-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {heroMediaType === "movie" ? "Featured Movie" : "Featured Series"}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
            <p className="line-clamp-3 max-w-xl text-sm text-muted sm:text-base">
              {hero.overview}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/watch/${heroMediaType}/${hero.id}`}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-background transition hover:brightness-110 active:scale-95"
              >
                <Play size={16} fill="currentColor" />
                Play Now
              </Link>
              <Link
                href={`/${heroMediaType}/${hero.id}`}
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
              >
                <Info size={16} />
                More Info
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 space-y-10">
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

        <Row title="Trending This Week" items={trending.results} />
        <Row
          title="Popular Movies"
          items={popularMovies.results}
          defaultMediaType="movie"
        />
        <Row
          title="Popular TV Shows"
          items={popularTV.results}
          defaultMediaType="tv"
        />
      </div>
    </main>
  );
}
