"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  isInWatchlist: boolean;
}

export function WatchlistButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  isInWatchlist: initial,
}: WatchlistButtonProps) {
  const [inList, setInList] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const toggle = () => {
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (inList) {
        await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("tmdb_id", tmdbId)
          .eq("media_type", mediaType);
        setInList(false);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("watchlist").upsert({
          user_id: user.id,
          tmdb_id: tmdbId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
        } as any);
        setInList(true);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        inList
          ? "bg-accent/15 text-accent hover:bg-accent/25"
          : "bg-surface text-white hover:bg-surface2"
      }`}
      aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : inList ? (
        <BookmarkCheck size={16} />
      ) : (
        <Bookmark size={16} />
      )}
      {inList ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
