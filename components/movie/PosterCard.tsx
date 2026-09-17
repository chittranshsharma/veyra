"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TMDBListItem } from "@/lib/tmdb/client";
import { RatingBadge } from "@/components/ui/Badge";

interface PosterCardProps {
  item: TMDBListItem;
  defaultMediaType?: "movie" | "tv";
  progressPercent?: number;
  season?: number | null;
  episode?: number | null;
  index?: number;
  topRank?: number;
}

export function PosterCard({
  item,
  defaultMediaType,
  progressPercent,
  season,
  episode,
  index = 0,
  topRank,
}: PosterCardProps) {
  const mediaType = item.media_type ?? defaultMediaType ?? (item.title ? "movie" : "tv");
  const title = item.title ?? item.name ?? "Untitled";
  const poster = tmdbImage(item.poster_path, "w300");
  const href = `/${mediaType}/${item.id}`;
  const year = item.release_date?.split("-")[0] ?? item.first_air_date?.split("-")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="relative shrink-0"
    >
      <Link
        href={href}
        className="group relative block w-[160px] overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/50 hover:shadow-[0_8px_24px_var(--accent-dim)] sm:w-[185px]"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface2">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="185px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface2 text-xs text-muted">
              No image
            </div>
          )}

          {/* Cineby-style Top 10 Ribbon Bookmark Badge */}
          {topRank != null && topRank > 0 && topRank <= 10 && (
            <div
              aria-hidden="true"
              className="absolute left-0 top-0 z-10 flex flex-col items-center justify-center font-bold overflow-hidden"
              style={{
                width: "32px",
                height: "40px",
                padding: "4px 2px 6px",
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
                background: "var(--accent)",
                color: "var(--on-accent)",
                boxShadow: "0 4px 12px var(--accent-glow)",
              }}
            >
              <span className="text-[9px] font-black uppercase tracking-wider leading-none">
                TOP
              </span>
              <span className="text-[12px] font-black leading-tight tabular-nums -mt-0.5">
                {String(topRank).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {progressPercent != null && progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-accent"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-2.5">
          <p className="truncate text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
            {title}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs">
            <RatingBadge rating={item.vote_average} />
            <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium tabular-nums">
              {year && <span>{year}</span>}
              <span className="text-text-muted/40">·</span>
              <span className="capitalize">{mediaType === "tv" ? "Series" : "Movie"}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
