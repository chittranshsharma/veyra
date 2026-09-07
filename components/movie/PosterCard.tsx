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
  index?: number;
}

export function PosterCard({
  item,
  defaultMediaType,
  progressPercent,
  index = 0,
}: PosterCardProps) {
  const mediaType = item.media_type ?? defaultMediaType ?? (item.title ? "movie" : "tv");
  const title = item.title ?? item.name ?? "Untitled";
  const poster = tmdbImage(item.poster_path, "w300");
  const href = `/${mediaType}/${item.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        href={href}
        className="group relative block w-[160px] shrink-0 overflow-hidden rounded-xl bg-surface transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-black/60 sm:w-[180px]"
      >
        <div className="relative aspect-[2/3] w-full">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="180px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface2 text-xs text-muted">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

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
        <div className="p-2">
          <p className="truncate text-sm font-medium text-white">{title}</p>
          <RatingBadge rating={item.vote_average} />
        </div>
      </Link>
    </motion.div>
  );
}
