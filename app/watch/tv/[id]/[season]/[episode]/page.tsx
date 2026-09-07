import { tmdb } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string; season: string; episode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, season, episode } = await params;
  try {
    const show = await tmdb.tvDetails(Number(id));
    return {
      title: `${show.name} — S${season}E${episode}`,
    };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchTVPage({ params }: Props) {
  const { id, season, episode } = await params;
  const tmdbId = Number(id);
  const seasonNum = Number(season);
  const episodeNum = Number(episode);

  let show, seasonDetails;
  try {
    [show, seasonDetails] = await Promise.all([
      tmdb.tvDetails(tmdbId),
      tmdb.seasonDetails(tmdbId, seasonNum),
    ]);
  } catch {
    notFound();
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
      .eq("media_type", "tv")
      .eq("season", seasonNum)
      .eq("episode", episodeNum)
      .maybeSingle();

    if (progress && !progress.completed) {
      resumeAtSeconds = progress.progress_seconds;
    }
  }

  const currentEpisode = seasonDetails.episodes.find(
    (ep) => ep.episode_number === episodeNum
  );

  const totalEpisodesInSeason = seasonDetails.episodes.length;
  const currentSeason = show.seasons.find((s) => s.season_number === seasonNum);
  const totalSeasons = show.number_of_seasons;

  const hasPrev =
    episodeNum > 1 ||
    (episodeNum === 1 && seasonNum > 1);
  const hasNext =
    episodeNum < totalEpisodesInSeason ||
    (episodeNum === totalEpisodesInSeason && seasonNum < totalSeasons);

  const prevHref = episodeNum > 1
    ? `/watch/tv/${tmdbId}/${seasonNum}/${episodeNum - 1}`
    : `/watch/tv/${tmdbId}/${seasonNum - 1}/1`;

  const nextHref = episodeNum < totalEpisodesInSeason
    ? `/watch/tv/${tmdbId}/${seasonNum}/${episodeNum + 1}`
    : `/watch/tv/${tmdbId}/${seasonNum + 1}/1`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/tv/${tmdbId}`}
          className="flex items-center gap-1 text-sm text-muted transition hover:text-white"
        >
          <ChevronLeft size={16} />
          {show.name}
        </Link>
        <span className="text-muted/40">/</span>
        <span className="text-sm text-muted">
          S{String(seasonNum).padStart(2, "0")}E{String(episodeNum).padStart(2, "0")}
        </span>
      </div>

      <VideoPlayer
        tmdbId={tmdbId}
        mediaType="tv"
        season={seasonNum}
        episode={episodeNum}
        resumeAtSeconds={resumeAtSeconds}
      />

      {/* Episode nav */}
      <div className="mt-4 flex items-center justify-between">
        {hasPrev ? (
          <Link
            href={prevHref}
            className="flex items-center gap-1.5 rounded-lg bg-surface px-4 py-2 text-sm font-medium text-white transition hover:bg-surface2"
          >
            <ChevronLeft size={16} />
            Previous
          </Link>
        ) : (
          <div />
        )}
        {hasNext && (
          <Link
            href={nextHref}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Next Episode
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Episode info */}
      {currentEpisode && (
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted">
            {currentSeason?.name} • Episode {episodeNum}
          </p>
          <h2 className="font-display text-xl font-bold text-white">
            {currentEpisode.name}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            {currentEpisode.overview}
          </p>
        </div>
      )}
    </main>
  );
}
