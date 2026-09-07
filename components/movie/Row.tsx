"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TMDBListItem } from "@/lib/tmdb/client";
import { PosterCard } from "./PosterCard";

interface RowProps {
  title: string;
  items: TMDBListItem[];
  defaultMediaType?: "movie" | "tv";
}

export function Row({ title, items, defaultMediaType }: RowProps) {
  const railRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!railRef.current) return;
    const amount = railRef.current.clientWidth * 0.75;
    railRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="group/row space-y-3">
      <div className="flex items-center justify-between px-4 sm:px-8">
        <h2 className="font-display text-xl font-semibold text-white">
          {title}
        </h2>
        <div className="hidden gap-1 md:flex">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-surface2 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-surface2 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="rail flex gap-3 overflow-x-auto px-4 pb-2 sm:px-8"
      >
        {items.map((item, i) => (
          <PosterCard
            key={`${item.media_type ?? defaultMediaType ?? "m"}-${item.id}`}
            item={item}
            defaultMediaType={defaultMediaType}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
