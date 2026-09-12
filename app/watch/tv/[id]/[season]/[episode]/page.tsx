import { tmdb, tmdbImage, type TMDBTVDetails, type TMDBSeasonDetails } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { WatchTVClient } from "./WatchTVClient";

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
    return { title: `Watch TV — S${season}E${episode}` };
  }
}

export default async function WatchTVPage({ params }: Props) {
  const { id, season, episode } = await params;
  const tmdbId = Number(id);
  const seasonNum = Number(season) || 1;
  const episodeNum = Number(episode) || 1;

  let show: TMDBTVDetails | null = null;
  let seasonDetails: TMDBSeasonDetails | null = null;

  try {
    [show, seasonDetails] = await Promise.all([
      tmdb.tvDetails(tmdbId),
      tmdb.seasonDetails(tmdbId, seasonNum),
    ]);
  } catch (err) {
    console.warn("[WatchTVPage] TMDB fetch warning (using fallback metadata):", err);
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

  const episodes = seasonDetails?.episodes ?? [];
  const currentEpisode = episodes.find(
    (ep) => ep.episode_number === episodeNum
  );

  const totalEpisodesInSeason = episodes.length > 0 ? episodes.length : 24;
  const currentSeason = show?.seasons?.find((s) => s.season_number === seasonNum);
  const totalSeasons = show?.number_of_seasons ?? 1;

  const hasPrev =
    episodeNum > 1 ||
    (episodeNum === 1 && seasonNum > 1);
  const hasNext =
    episodeNum < totalEpisodesInSeason ||
    (episodeNum === totalEpisodesInSeason && seasonNum < totalSeasons);

  const prevHref = episodeNum > 1
    ? `/watch/tv/${tmdbId}/${seasonNum}/${episodeNum - 1}`
    : `/watch/tv/${tmdbId}/${Math.max(1, seasonNum - 1)}/1`;

  const nextHref = episodeNum < totalEpisodesInSeason
    ? `/watch/tv/${tmdbId}/${seasonNum}/${episodeNum + 1}`
    : `/watch/tv/${tmdbId}/${seasonNum + 1}/1`;

  // Pre-fetch next episode data for the toast
  const nextEpisodeInSeason = episodes.find(
    (ep) => ep.episode_number === episodeNum + 1
  );
  const nextEpisodeName = nextEpisodeInSeason?.name ?? `Episode ${episodeNum + 1}`;
  const nextEpisodeStill = nextEpisodeInSeason?.still_path
    ? tmdbImage(nextEpisodeInSeason.still_path, "w300")
    : null;
  const nextEpisodeNumber = episodeNum < totalEpisodesInSeason ? episodeNum + 1 : 1;
  const nextSeasonNumber = episodeNum < totalEpisodesInSeason ? seasonNum : seasonNum + 1;

  return (
    <WatchTVClient
      tmdbId={tmdbId}
      seasonNum={seasonNum}
      episodeNum={episodeNum}
      showName={show?.name ?? "TV Series"}
      currentEpisodeName={currentEpisode?.name ?? `Episode ${episodeNum}`}
      currentSeasonName={currentSeason?.name ?? `Season ${seasonNum}`}
      currentEpisodeOverview={currentEpisode?.overview ?? show?.overview ?? ""}
      hasPrev={hasPrev}
      hasNext={hasNext}
      prevHref={prevHref}
      nextHref={nextHref}
      nextEpisodeName={nextEpisodeName}
      nextEpisodeStill={nextEpisodeStill}
      nextEpisodeNumber={nextEpisodeNumber}
      nextSeasonNumber={nextSeasonNumber}
      resumeAtSeconds={resumeAtSeconds}
      tvId={id}
    />
  );
}
