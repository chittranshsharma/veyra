import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tmdb, tmdbImage } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { WatchlistButton } from "@/components/movie/WatchlistButton";
import { TrailerModal } from "@/components/movie/TrailerModal";
import { SeasonAccordion } from "@/components/movie/SeasonAccordion";
import { ReviewSection, type ReviewItem } from "@/components/movie/ReviewSection";
import { AddToCollectionButton } from "@/components/movie/AddToCollectionButton";
import { AiXRayButton } from "@/components/ai/AiXRayButton";
import { buttonVariants } from "@/components/ui/Button";
import { Row } from "@/components/movie/Row";
import { Badge } from "@/components/ui/Badge";
import { Play, Star } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await tmdb.tvDetails(Number(id));
    return {
      title: show.name ?? "TV Show",
      description: show.overview,
      openGraph: {
        images: tmdbImage(show.backdrop_path, "w1280")
          ? [{ url: tmdbImage(show.backdrop_path, "w1280")! }]
          : [],
      },
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TVDetailPage({ params }: Props) {
  const { id } = await params;
  const tmdbId = Number(id);

  let show;
  try {
    show = await tmdb.tvDetails(tmdbId);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isInWatchlist = false;
  if (user) {
    const { data } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", "tv")
      .maybeSingle();
    isInWatchlist = !!data;
  }

  // Fetch reviews for this TV show
  const { data: dbReviews } = await supabase
    .from("reviews")
    .select("id, user_id, tmdb_id, media_type, rating, comment, created_at, profiles(username, avatar_url)")
    .eq("tmdb_id", tmdbId)
    .eq("media_type", "tv")
    .order("created_at", { ascending: false });

  const initialReviews = (dbReviews ?? []) as unknown as ReviewItem[];
  const averageVeyraRating =
    initialReviews.length > 0
      ? (
          initialReviews.reduce((sum, r) => sum + r.rating, 0) /
          initialReviews.length
        ).toFixed(1)
      : null;

  const similarShows = show.genres[0]
    ? await tmdb.discoverByGenre("tv", show.genres[0].id)
    : null;

  const backdrop = tmdbImage(show.backdrop_path, "original");
  const poster = tmdbImage(show.poster_path, "w500");
  const trailer = show.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const cast = show.credits?.cast?.slice(0, 12) ?? [];
  const year = show.first_air_date?.split("-")[0];

  // First episode of first real season
  const firstSeason = show.seasons.find((s) => s.season_number > 0);

  return (
    <main className="relative">
      {/* Ambient blurred backdrop — sits fixed behind the entire page for cinematic depth */}
      {backdrop && (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-20">
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            className="object-cover object-top blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>
      )}

      {/* Cinematic Detail Hero — Unified so content is never half-blocked */}
      <section className="relative min-h-[500px] lg:min-h-[560px] w-full overflow-hidden flex items-end pt-20 pb-8 sm:pb-12">
        {backdrop && (
          <Image
            src={backdrop}
            alt={show.name ?? ""}
            fill
            priority
            className="object-cover object-top hero-backdrop opacity-70"
          />
        )}

        {/* Triple cinematic lighting scrims */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background/90 via-background/30 to-transparent pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent pointer-events-none z-[1]" />
        <div className="ambient-glow pointer-events-none z-[1]" />

        {/* Foreground Content: Poster, Title, Meta, Synopsis, Action Buttons */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            {/* Poster */}
            {poster && (
              <div className="shrink-0">
                <Image
                  src={poster}
                  alt={show.name ?? ""}
                  width={220}
                  height={330}
                  priority
                  className="rounded-2xl shadow-2xl shadow-black/80 border border-white/10 w-[180px] sm:w-[220px] aspect-[2/3] object-cover"
                />
              </div>
            )}

            {/* Meta & Actions */}
            <div className="flex-1 space-y-3.5 text-center sm:text-left">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight drop-shadow-md">
                {show.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs">
                {/* Score badge */}
                <div className="flex items-center gap-1 rounded-md bg-surface2/90 px-2.5 py-1 text-xs font-bold text-text-primary border border-border">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-amber-500 tabular-nums">{show.vote_average.toFixed(1)}</span>
                </div>

                {/* Veyra Users score */}
                {averageVeyraRating && (
                  <div className="flex items-center gap-1 rounded-md bg-accent/15 border border-accent/30 px-2.5 py-1 text-xs font-semibold text-text-primary">
                    <span className="text-accent font-bold text-[10px] uppercase">Veyra</span>
                    <Star size={11} className="fill-accent text-accent" />
                    <span className="font-bold tabular-nums">{averageVeyraRating}</span>
                    <span className="text-[10px] text-muted">({initialReviews.length})</span>
                  </div>
                )}

                {year && (
                  <>
                    <span className="text-text-muted/40">·</span>
                    <span className="text-text-secondary font-medium tabular-nums">{year}</span>
                  </>
                )}

                <span className="text-text-muted/40">·</span>
                <span className="text-text-secondary font-medium tabular-nums">
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
                </span>

                <span className="text-text-muted/40">·</span>
                <span className="text-text-secondary font-medium tabular-nums">
                  {show.number_of_episodes} Episodes
                </span>

                {show.genres.map((g) => (
                  <Badge key={g.id}>{g.name}</Badge>
                ))}
              </div>

              {show.overview && (
                <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-text-secondary line-clamp-3 sm:line-clamp-4">
                  {show.overview}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                {firstSeason && (
                  <Link
                    href={`/watch/tv/${tmdbId}/${firstSeason.season_number}/1`}
                    className={buttonVariants({ variant: "primary", size: "lg", className: "active:scale-95 shadow-lg shadow-accent/25" })}
                  >
                    <Play size={16} fill="currentColor" />
                    Watch S1 E1
                  </Link>
                )}
                {trailer && (
                  <TrailerModal youtubeKey={trailer.key} movieTitle={show.name ?? ""} />
                )}
                <AiXRayButton
                  title={show.name ?? "TV Series"}
                  mediaType="tv"
                  overview={show.overview}
                  genres={show.genres.map((g) => g.name)}
                  cast={cast.map((c) => c.name)}
                />
                <WatchlistButton
                  tmdbId={tmdbId}
                  mediaType="tv"
                  title={show.name ?? ""}
                  posterPath={show.poster_path}
                  isInWatchlist={isInWatchlist}
                />
                {user && (
                  <AddToCollectionButton
                    tmdbId={tmdbId}
                    mediaType="tv"
                    title={show.name ?? ""}
                    posterPath={show.poster_path}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Seasons, Cast, Reviews */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12 mt-8">

        {/* Seasons & Episodes */}
        <section className="mt-14 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">Seasons</h2>
          <SeasonAccordion tvId={tmdbId} seasons={show.seasons} />
        </section>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-14 space-y-4">
            <h2 className="gradient-heading font-display text-2xl font-semibold">Cast</h2>
            <div className="rail flex gap-4 overflow-x-auto pb-2">
              {cast.map((member) => (
                <Link
                  key={member.id}
                  href={`/person/${member.id}`}
                  className="group w-24 shrink-0 text-center"
                >
                  <div className="glow-card relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface2">
                    {member.profile_path && (
                      <Image
                        src={tmdbImage(member.profile_path, "w200")!}
                        alt={member.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-text-primary transition group-hover:text-accent">
                    {member.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {member.character}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ReviewSection
          tmdbId={tmdbId}
          mediaType="tv"
          currentUserId={user?.id}
          initialReviews={initialReviews}
        />

        {/* Similar TV */}
        {similarShows && similarShows.results.length > 0 && (
          <div className="mt-14 pb-16">
            <Row
              title="You Might Also Like"
              items={similarShows.results.filter((s) => s.id !== tmdbId)}
              defaultMediaType="tv"
            />
          </div>
        )}
      </div>
    </main>
  );
}
