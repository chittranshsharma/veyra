import { tmdb } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { AiXRayButton } from "@/components/ai/AiXRayButton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdb.movieDetails(Number(id));
    return { title: `Watch ${movie.title}` };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchMoviePage({ params }: Props) {
  const { id } = await params;
  const tmdbId = Number(id);

  let movie;
  try {
    movie = await tmdb.movieDetails(tmdbId);
  } catch (err) {
    console.warn("[WatchMoviePage] TMDB fetch warning (using fallback metadata):", err);
    movie = {
      id: tmdbId,
      title: "Movie",
      overview: "",
      genres: [],
      release_date: "",
      credits: { cast: [] },
      runtime: 0,
      tagline: "",
      vote_average: 0,
      poster_path: null,
      backdrop_path: null,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let resumeAtSeconds: number | undefined;
  if (user) {
    const { data: progress } = await supabase
      .from("watch_progress")
      .select("progress_seconds, completed")
      .eq("user_id", user.id)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", "movie")
      .maybeSingle();

    if (progress && !progress.completed) {
      resumeAtSeconds = progress.progress_seconds;
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/movie/${tmdbId}`}
          className="flex items-center gap-1 text-sm text-muted transition hover:text-white"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="font-display text-lg font-semibold text-white truncate">
          {movie.title}
        </h1>
      </div>

      <VideoPlayer
        tmdbId={tmdbId}
        mediaType="movie"
        resumeAtSeconds={resumeAtSeconds}
      />

      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-white">
              {movie.title}
            </h2>
            {movie.release_date && (
              <span className="text-sm text-muted">
                {movie.release_date.split("-")[0]}
              </span>
            )}
          </div>
          <AiXRayButton
            title={movie.title ?? "Movie"}
            mediaType="movie"
            overview={movie.overview}
            genres={movie.genres.map((g) => g.name)}
            cast={movie.credits?.cast.map((c) => c.name) ?? []}
            variant="player"
          />
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          {movie.overview}
        </p>
      </div>
    </main>
  );
}
