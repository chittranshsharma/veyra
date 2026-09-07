import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tmdb, tmdbImage } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { WatchlistButton } from "@/components/movie/WatchlistButton";
import { TrailerModal } from "@/components/movie/TrailerModal";
import { Row } from "@/components/movie/Row";
import { Badge, RatingBadge } from "@/components/ui/Badge";
import { Play, Clock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdb.movieDetails(Number(id));
    return {
      title: movie.title ?? "Movie",
      description: movie.overview,
      openGraph: {
        images: tmdbImage(movie.backdrop_path, "w1280")
          ? [{ url: tmdbImage(movie.backdrop_path, "w1280")! }]
          : [],
      },
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const tmdbId = Number(id);

  let movie;
  try {
    movie = await tmdb.movieDetails(tmdbId);
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
      .eq("media_type", "movie")
      .maybeSingle();
    isInWatchlist = !!data;
  }

  const similarMovies = movie.genres[0]
    ? await tmdb.discoverByGenre("movie", movie.genres[0].id)
    : null;

  // Resolve nullable fields once so TypeScript is happy throughout
  const title = movie.title ?? "Untitled";
  const backdrop = tmdbImage(movie.backdrop_path, "original");
  const poster = tmdbImage(movie.poster_path, "w500");
  const trailer = movie.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const cast = movie.credits?.cast?.slice(0, 12) ?? [];
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const year = movie.release_date?.split("-")[0];

  return (
    <main>
      {/* Hero backdrop */}
      <section className="relative h-[65vh] w-full overflow-hidden">
        {backdrop && (
          <Image
            src={backdrop}
            alt={title}
            fill
            priority
            className="object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="-mt-40 flex flex-col gap-8 sm:flex-row lg:-mt-48">
          {/* Poster */}
          {poster && (
            <div className="hidden shrink-0 sm:block">
              <Image
                src={poster}
                alt={title}
                width={240}
                height={360}
                className="rounded-2xl shadow-2xl shadow-black/60"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex-1 space-y-4 pt-4 sm:pt-12">
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              {title}
            </h1>

            {movie.tagline && (
              <p className="text-sm italic text-muted">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <RatingBadge rating={movie.vote_average} />
              {year && <span className="text-sm text-muted">{year}</span>}
              {runtime && (
                <span className="flex items-center gap-1 text-sm text-muted">
                  <Clock size={14} />
                  {runtime}
                </span>
              )}
              {movie.genres.map((g) => (
                <Badge key={g.id}>{g.name}</Badge>
              ))}
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/watch/movie/${tmdbId}`}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-background transition hover:brightness-110 active:scale-95"
              >
                <Play size={16} fill="currentColor" />
                Watch Now
              </Link>
              {trailer && (
                <TrailerModal youtubeKey={trailer.key} movieTitle={title} />
              )}
              <WatchlistButton
                tmdbId={tmdbId}
                mediaType="movie"
                title={title}
                posterPath={movie.poster_path}
                isInWatchlist={isInWatchlist}
              />
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-14 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-white">Cast</h2>
            <div className="rail flex gap-4 overflow-x-auto pb-2">
              {cast.map((member) => (
                <div key={member.id} className="w-24 shrink-0 text-center">
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface2">
                    {member.profile_path && (
                      <Image
                        src={tmdbImage(member.profile_path, "w200")!}
                        alt={member.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-white">
                    {member.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar movies */}
        {similarMovies && similarMovies.results.length > 0 && (
          <div className="mt-14 pb-16">
            <Row
              title="You Might Also Like"
              items={similarMovies.results.filter((m) => m.id !== tmdbId)}
              defaultMediaType="movie"
            />
          </div>
        )}
      </div>
    </main>
  );
}
