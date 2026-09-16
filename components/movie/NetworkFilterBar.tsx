"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Tv, Film, Sparkles } from "lucide-react";
import { TV_NETWORKS, MOVIE_STUDIOS, type NetworkItem } from "@/lib/tmdb/networks";

export { TV_NETWORKS, MOVIE_STUDIOS, type NetworkItem };

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
              ? "bg-accent text-[var(--on-accent)] font-semibold shadow-sm"
              : "bg-surface text-muted border border-border hover:bg-surface2 hover:text-text-primary"
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
                  : "bg-surface text-muted border-border hover:border-accent/40 hover:text-text-primary hover:bg-surface2"
              }`}
            >
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-tight uppercase ${
                  isSelected
                    ? "bg-accent text-[var(--on-accent)]"
                    : "bg-surface2 text-text-secondary border border-border group-hover:text-text-primary"
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
