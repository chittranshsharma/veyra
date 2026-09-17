import Image from "next/image";
import Link from "next/link";
import { tmdb, tmdbImage } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { Row } from "@/components/movie/Row";
import { PosterCard } from "@/components/movie/PosterCard";
import { HomeAiBanner } from "@/components/ai/HomeAiBanner";
import { InfiniteMovingCards, type InfiniteCardItem } from "@/components/ui/InfiniteMovingCards";
import { FilmMarqueeStrip } from "@/components/ui/FilmMarqueeStrip";
import { DeciderSection } from "@/components/decider/DeciderSection";
import { BecauseYouWatched } from "@/components/home/BecauseYouWatched";
import { RightNowSection } from "@/components/home/RightNowSection";
import { FriendsTonightSection } from "@/components/home/FriendsTonightSection";
import { Play, Info, Sparkles, Film, Tv, Flame, Library, ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

const CINEMA_QUOTES: InfiniteCardItem[] = [
  {
    quote: "To see the world, things dangerous to come to, to see behind walls, draw closer, to find each other and to feel. That is the purpose of life.",
    title: "The Secret Life of Walter Mitty",
    year: "2013",
    characterOrPerson: "Sean O'Connell",
    rating: 7.3,
    badge: "Cinema Poetry",
    href: "/search?q=The+Secret+Life+of+Walter+Mitty",
  },
  {
    quote: "Why do we fall, Bruce? So that we can learn to pick ourselves back up.",
    title: "The Dark Knight",
    year: "2008",
    characterOrPerson: "Alfred Pennyworth",
    rating: 9.0,
    badge: "Masterpiece",
    href: "/search?q=The+Dark+Knight",
  },
  {
    quote: "Hope is a good thing, maybe the best of things, and no good thing ever dies.",
    title: "The Shawshank Redemption",
    year: "1994",
    characterOrPerson: "Andy Dufresne",
    rating: 9.3,
    badge: "All-Time #1",
    href: "/search?q=The+Shawshank+Redemption",
  },
  {
    quote: "The journey of a musician is paved with heartbreak, longing, and sublime devotion.",
    title: "Rockstar",
    year: "2011",
    characterOrPerson: "Jordan / Janardhan",
    rating: 7.7,
    badge: "Cult Classic",
    href: "/search?q=Rockstar",
  },
  {
    quote: "It's only after we've lost everything that we're free to do anything.",
    title: "Fight Club",
    year: "1999",
    characterOrPerson: "Tyler Durden",
    rating: 8.8,
    badge: "Modern Myth",
    href: "/search?q=Fight+Club",
  },
  {
    quote: "Carpe diem. Seize the day, boys. Make your lives extraordinary.",
    title: "Dead Poets Society",
    year: "1989",
    characterOrPerson: "John Keating",
    rating: 8.6,
    badge: "Essential",
    href: "/search?q=Dead+Poets+Society",
  },
  {
    quote: "I would rather share one lifetime with you than face all the ages of this world alone.",
    title: "The Lord of the Rings",
    year: "2001",
    characterOrPerson: "Arwen Undómiel",
    rating: 8.9,
    badge: "Epic Cinema",
    href: "/search?q=The+Lord+of+the+Rings",
  },
];

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
    <main className="min-h-screen pb-28">
      {/* Hero */}
      {hero && (
        <section className="relative h-[82vh] min-h-[460px] w-full overflow-hidden">
          {backdrop && (
            <Image
              src={backdrop}
              alt={heroTitle}
              fill
              priority
              className="object-cover object-top hero-backdrop transition-transform duration-1000 ease-out"
            />
          )}

          {/* Triple-layer cinematic scrims (Cineby atmospheric lighting) */}
          {/* Top scrim: seamlessly blends header into hero */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-background/90 via-background/35 to-transparent pointer-events-none z-[4]" />

          {/* Bottom vignette: anchors hero text and seamlessly transitions to page content */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-transparent pointer-events-none z-[4]" />

          {/* Left vignette: frames title for effortless readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/45 to-transparent pointer-events-none z-[4]" />

          {/* Dynamic multi-color ambient glow */}
          <div className="ambient-glow pointer-events-none z-[4]" />

          <div className="absolute bottom-12 left-4 max-w-2xl space-y-4 sm:left-8 lg:left-16 z-10">
            {/* Feature badges row with Cineby-grade tabular meta */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent border border-accent/40 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                SPOTLIGHT
              </span>

              {hero.vote_average && (
                <span className="inline-flex items-center gap-1 font-bold text-amber-500 tabular-nums">
                  <Star size={13} fill="currentColor" />
                  {hero.vote_average.toFixed(1)}
                </span>
              )}

              {heroYear && (
                <>
                  <span className="text-text-muted/40">·</span>
                  <span className="font-semibold text-text-secondary tabular-nums">
                    {heroYear}
                  </span>
                </>
              )}

              <span className="text-text-muted/40">·</span>
              <span className="uppercase text-[11px] font-bold tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-md border border-accent/25">
                {heroMediaType === "tv" ? "TV Series" : "Feature Film"}
              </span>

              <span className="rounded-md bg-surface2/80 px-2 py-0.5 text-[11px] font-semibold text-text-secondary border border-border backdrop-blur-sm">
                4K Ultra HD
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-[-0.03em] uppercase text-text-primary drop-shadow-[0_8px_32px_rgba(0,0,0,0.65)]">
              {heroTitle}
            </h1>

            <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
              {hero.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={heroMediaType === "tv" ? `/watch/tv/${hero.id}/1/1` : `/watch/movie/${hero.id}`}
                className={buttonVariants({
                  variant: "primary",
                  size: "xl",
                  className: "active:scale-95 shadow-lg shadow-accent/25",
                })}
              >
                <Play size={18} fill="currentColor" />
                Play Now
              </Link>
              <Link
                href={`/${heroMediaType}/${hero.id}`}
                className={buttonVariants({
                  variant: "subtle",
                  size: "xl",
                  className: "active:scale-95 backdrop-blur-md",
                })}
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
          <Link href="/" className="chip chip-active shrink-0">
            <Flame size={14} />
            Trending
          </Link>
          <Link href="/movies" className="chip shrink-0">
            <Film size={14} />
            Movies
          </Link>
          <Link href="/tv" className="chip shrink-0">
            <Tv size={14} />
            TV Shows
          </Link>
          <Link href="/movies?genre=28" className="chip shrink-0">
            Action & Thrills
          </Link>
          <Link href="/movies?genre=878" className="chip shrink-0">
            Sci-Fi & Fantasy
          </Link>
          <Link href="/movies?genre=18" className="chip shrink-0">
            Drama
          </Link>
          <Link href="/collections" className="chip shrink-0">
            <Library size={14} />
            Curated Collections
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-12">
        {/* Continue watching rail */}
        {continueItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="gradient-heading px-4 font-display text-xl font-semibold sm:px-8">
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

        {/* Trending This Week (Top 10 ribbon bookmarks) */}
        <Row title="Trending This Week" items={trending.results} showRank={true} />

        {/* The Decider (Interactive swipe decision engine) */}
        <DeciderSection />

        {/* Film Marquee Strip (Classic running film title ticker) */}
        <FilmMarqueeStrip />

        {/* Popular Movies */}
        <Row
          title="Popular Movies"
          items={popularMovies.results}
          defaultMediaType="movie"
        />

        {/* Popular TV Shows */}
        <Row
          title="Popular TV Shows"
          items={popularTV.results}
          defaultMediaType="tv"
        />

        {/* Because You Watched (Post-Binge Recovery) */}
        <BecauseYouWatched />

        {/* Right Now (Live community pulse & Most Watched this week) */}
        <RightNowSection />

        {/* Friends Tonight (Your Circle feed & Watchlist quick-adds) */}
        <FriendsTonightSection isAuthenticated={Boolean(user)} />

        {/* Veyra AI Movie Finder Banner */}
        <HomeAiBanner />

        {/* Aceternity UI: Infinite Moving Cinema Cards */}
        <section className="space-y-3 py-2">
          <div className="flex items-center justify-between px-4 sm:px-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider mb-1">
                <Sparkles size={12} />
                <span>Cinematic Echoes</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
                Iconic Lines &amp; Cinema Memories
              </h2>
            </div>
          </div>

          <InfiniteMovingCards
            items={CINEMA_QUOTES}
            direction="left"
            speed="normal"
            pauseOnHover={true}
          />
        </section>

        {/* Curated Collections Spotlight Banner */}
        <section className="mx-4 sm:mx-8 rounded-2xl border border-border bg-surface p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <Sparkles size={13} />
                Letterboxd-Style Lists
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
                Discover & Create Custom Collections
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Organize your favorite cinema into themed playlists, rank franchise marathons, or explore lists curated by the Veyra community.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/collections"
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                Browse Collections
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/collections/new"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                + Create List
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
