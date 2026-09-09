"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

export interface GenreOption {
  id?: number;
  label: string;
  emoji?: string;
}

const MOODS: GenreOption[] = [
  { label: "All", emoji: "🎬" },
  { id: 28, label: "Action", emoji: "💥" },
  { id: 878, label: "Sci-Fi", emoji: "🚀" },
  { id: 27, label: "Horror", emoji: "👻" },
  { id: 35, label: "Comedy", emoji: "😂" },
  { id: 18, label: "Drama", emoji: "🎭" },
  { id: 10749, label: "Romance", emoji: "❤️" },
  { id: 53, label: "Thriller", emoji: "🔪" },
  { id: 16, label: "Animation", emoji: "✨" },
  { id: 36, label: "History", emoji: "📜" },
  { id: 12, label: "Adventure", emoji: "🗺️" },
  { id: 14, label: "Fantasy", emoji: "🧙" },
  { id: 80, label: "Crime", emoji: "🕵️" },
  { id: 10751, label: "Family", emoji: "👨‍👩‍👧" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
];

interface GenreFilterBarProps {
  activeGenre?: number;
  activeSort?: string;
}

export function GenreFilterBar({ activeGenre, activeSort = "popularity.desc" }: GenreFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (genre?: number, sort?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (genre) {
      params.set("genre", String(genre));
    } else {
      params.delete("genre");
    }
    if (sort && sort !== "popularity.desc") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      {/* Genre pill bar */}
      <div className="rail flex gap-2 overflow-x-auto px-4 pb-1 sm:px-8">
        {MOODS.map((mood) => {
          const isActive = mood.id ? activeGenre === mood.id : !activeGenre;
          return (
            <button
              key={mood.label}
              onClick={() => setParam(mood.id, activeSort)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-background"
                  : "bg-surface text-muted hover:bg-surface2 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-genre-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">
                {mood.emoji} {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-2 px-4 sm:px-8">
        <span className="text-xs text-muted">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setParam(activeGenre, opt.value)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              activeSort === opt.value
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-muted hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
