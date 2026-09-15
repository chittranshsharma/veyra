"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TMDBListItem } from "@/lib/tmdb/client";
import { RatingBadge } from "@/components/ui/Badge";
import { Play, Info } from "lucide-react";

interface PosterCardProps {
  item: TMDBListItem;
  defaultMediaType?: "movie" | "tv";
  progressPercent?: number;
  season?: number | null;
  episode?: number | null;
  index?: number;
}

export function PosterCard({
  item,
  defaultMediaType,
  progressPercent,
  season,
  episode,
  index = 0,
}: PosterCardProps) {
  const mediaType = item.media_type ?? defaultMediaType ?? (item.title ? "movie" : "tv");
  const title = item.title ?? item.name ?? "Untitled";
  const poster = tmdbImage(item.poster_path, "w300");
  const backdrop = tmdbImage(item.backdrop_path, "w500");
  const href = `/${mediaType}/${item.id}`;
  const watchHref =
    mediaType === "tv"
      ? `/watch/tv/${item.id}/${season ?? 1}/${episode ?? 1}`
      : `/watch/movie/${item.id}`;

  const [isHovered, setIsHovered] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimer.current = setTimeout(() => setShowPopover(true), 380);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPopover(false);
  };

  const year = item.release_date?.split("-")[0] ?? item.first_air_date?.split("-")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="relative shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className="glow-card group relative block w-[160px] overflow-hidden rounded-xl bg-surface sm:w-[185px]"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="185px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface2 text-xs text-muted">
              No image
            </div>
          )}

          {/* Interactive quick-action hover overlay right on the card */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="space-y-2 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                {year && <span>{year}</span>}
                <span>•</span>
                <span className="uppercase text-[10px] bg-white/15 px-1.5 py-0.5 rounded text-white">
                  {mediaType}
                </span>
              </div>
              
              <div className="flex gap-1.5 pt-1">
                <span
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = watchHref;
                  }}
                  className="btn-shimmer flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-1.5 text-xs font-bold text-background shadow-lg shadow-accent/25 hover:brightness-110"
                >
                  <Play size={12} fill="currentColor" />
                  Play
                </span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = href;
                  }}
                  className="flex items-center justify-center rounded-lg bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/30"
                >
                  <Info size={13} />
                </span>
              </div>
            </div>
          </div>

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
          <p className="truncate text-sm font-semibold text-white group-hover:text-accent transition-colors">
            {title}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <RatingBadge rating={item.vote_average} />
            {year && <span className="text-xs text-muted font-medium">{year}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
