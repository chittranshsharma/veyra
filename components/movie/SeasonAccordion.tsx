"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TMDBSeason, TMDBEpisode } from "@/lib/tmdb/client";

interface SeasonAccordionProps {
  tvId: number;
  seasons: TMDBSeason[];
}

export function SeasonAccordion({ tvId, seasons }: SeasonAccordionProps) {
  const [openSeason, setOpenSeason] = useState<number | null>(
    seasons.find((s) => s.season_number > 0)?.season_number ?? null
  );
  const [episodes, setEpisodes] = useState<Record<number, TMDBEpisode[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const toggleSeason = async (seasonNum: number) => {
    if (openSeason === seasonNum) {
      setOpenSeason(null);
      return;
    }
    setOpenSeason(seasonNum);

    if (!episodes[seasonNum]) {
      setLoading((prev) => ({ ...prev, [seasonNum]: true }));
      try {
        const res = await fetch(`/api/tmdb/season?tvId=${tvId}&season=${seasonNum}`);
        const data = await res.json();
        setEpisodes((prev) => ({ ...prev, [seasonNum]: data.episodes ?? [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [seasonNum]: false }));
      }
    }
  };

  const mainSeasons = seasons.filter((s) => s.season_number > 0);

  return (
    <div className="space-y-2">
      {mainSeasons.map((season) => (
        <div key={season.season_number} className="overflow-hidden rounded-2xl bg-surface">
          <button
            onClick={() => toggleSeason(season.season_number)}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface2"
          >
            {season.poster_path && (
              <Image
                src={tmdbImage(season.poster_path, "w200")!}
                alt={season.name}
                width={48}
                height={72}
                className="rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-white">{season.name}</p>
              <p className="text-sm text-muted">{season.episode_count} episodes</p>
            </div>
            {openSeason === season.season_number ? (
              <ChevronUp size={18} className="text-muted" />
            ) : (
              <ChevronDown size={18} className="text-muted" />
            )}
          </button>

          {openSeason === season.season_number && (
            <div className="border-t border-white/5 px-5 pb-4">
              {loading[season.season_number] ? (
                <div className="space-y-3 pt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  {(episodes[season.season_number] ?? []).map((ep) => (
                    <Link
                      key={ep.episode_number}
                      href={`/watch/tv/${tvId}/${season.season_number}/${ep.episode_number}`}
                      className="flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-surface2"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface2 text-xs font-bold text-muted">
                        {ep.episode_number}
                      </div>
                      {ep.still_path ? (
                        <Image
                          src={tmdbImage(ep.still_path, "w300")!}
                          alt={ep.name}
                          width={80}
                          height={45}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-[45px] w-[80px] shrink-0 rounded-lg bg-surface2" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {ep.name}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted">{ep.overview}</p>
                      </div>
                      <Play size={14} className="shrink-0 text-accent" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
