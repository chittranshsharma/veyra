"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Tv, Film, Sparkles } from "lucide-react";

export interface NetworkItem {
  id: number;
  label: string;
  badge: string;
  tagline: string;
}

export const TV_NETWORKS: NetworkItem[] = [
  { id: 49, label: "HBO / Max", badge: "HBO", tagline: "Prestige Television" },
  { id: 213, label: "Netflix", badge: "NETFLIX", tagline: "Global Originals" },
  { id: 2552, label: "Apple TV+", badge: "Apple TV+", tagline: "High-Concept Sci-Fi & Drama" },
  { id: 2739, label: "Disney+", badge: "Disney+", tagline: "Franchises & Animation" },
  { id: 1024, label: "Prime Video", badge: "Prime", tagline: "Blockbuster Series" },
  { id: 88, label: "FX", badge: "FX", tagline: "Edgy Masterpieces" },
  { id: 4330, label: "Paramount+", badge: "Paramount+", tagline: "Expansive Universes" },
];

export const MOVIE_STUDIOS: NetworkItem[] = [
  { id: 41077, label: "A24", badge: "A24", tagline: "Auteur & Cult Classics" },
  { id: 174, label: "Warner Bros.", badge: "WB", tagline: "Epic Cinematic Worlds" },
  { id: 420, label: "Marvel Studios", badge: "Marvel", tagline: "Superheroes & MCU" },
  { id: 33, label: "Universal", badge: "Universal", tagline: "Blockbusters & Thrillers" },
  { id: 4, label: "Paramount", badge: "Paramount", tagline: "Iconic Franchises" },
  { id: 5, label: "Columbia Pictures", badge: "Columbia", tagline: "Legendary Cinema" },
];

interface NetworkFilterBarProps {
  mediaType: "tv" | "movie";
  activeNetworkId?: number;
}

export function NetworkFilterBar({ mediaType, activeNetworkId }: NetworkFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = mediaType === "tv" ? TV_NETWORKS : MOVIE_STUDIOS;
  const paramKey = mediaType === "tv" ? "network" : "studio";

  const handleSelect = (id?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id && id !== activeNetworkId) {
      params.set(paramKey, String(id));
      // Clear genre to avoid over-constraining
      params.delete("genre");
    } else {
      params.delete(paramKey);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const activeItem = items.find((i) => i.id === activeNetworkId);

  return (
    <div className="space-y-3 px-4 sm:px-8 lg:px-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          {mediaType === "tv" ? <Tv size={13} className="text-accent" /> : <Film size={13} className="text-accent" />}
          <span>Browse by {mediaType === "tv" ? "Network & Platform" : "Studio & Production"}</span>
        </div>
        {activeItem && (
          <span className="text-xs text-accent font-medium flex items-center gap-1">
            <Sparkles size={12} />
            Showing: {activeItem.label} ({activeItem.tagline})
          </span>
        )}
      </div>

      <div className="rail flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleSelect(undefined)}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
            !activeNetworkId
              ? "bg-white/15 text-white font-semibold shadow-sm border border-white/20"
              : "bg-surface text-muted border border-white/5 hover:bg-surface2 hover:text-white"
          }`}
        >
          All {mediaType === "tv" ? "Networks" : "Studios"}
        </button>

        {items.map((item) => {
          const isSelected = item.id === activeNetworkId;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(item.id)}
              className={`group shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? "bg-accent/15 text-accent font-semibold border-accent/40 shadow-sm shadow-accent/10"
                  : "bg-surface/80 text-muted/90 border-white/5 hover:border-white/20 hover:text-white hover:bg-surface2"
              }`}
            >
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-tight uppercase ${
                  isSelected
                    ? "bg-accent text-background"
                    : "bg-white/10 text-white/80 group-hover:bg-white/20"
                }`}
              >
                {item.badge}
              </span>
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
