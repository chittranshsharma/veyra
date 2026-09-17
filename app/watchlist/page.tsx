import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PosterCard } from "@/components/movie/PosterCard";
import { BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import type { Metadata } from "next";
import type { TMDBListItem } from "@/lib/tmdb/client";
import type { MediaType } from "@/types/database";

export const metadata: Metadata = {
  title: "My Watchlist",
  description: "Your saved movies and TV shows.",
};

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/watchlist");

  const { data: items } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const watchlistItems = items ?? [];

  // Convert watchlist rows to TMDBListItem shape for PosterCard
  const posterItems: (TMDBListItem & { media_type: MediaType })[] =
    watchlistItems.map((item) => ({
      id: item.tmdb_id,
      title: item.media_type === "movie" ? item.title : undefined,
      name: item.media_type === "tv" ? item.title : undefined,
      poster_path: item.poster_path,
      backdrop_path: null,
      overview: "",
      vote_average: 0,
      media_type: item.media_type as MediaType,
    }));

  return (
    <main className="mx-auto max-w-7xl min-h-screen px-4 py-8 pb-32 sm:px-8">
      <div className="mb-8 flex items-center gap-3">
        <BookmarkCheck size={28} className="text-accent" />
        <h1 className="font-display text-3xl font-bold text-white">My Watchlist</h1>
      </div>

      {posterItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <BookmarkCheck size={56} className="text-muted/30" />
          <div>
            <p className="text-xl font-semibold text-white">Nothing saved yet</p>
            <p className="mt-2 text-sm text-muted">
              Browse movies and shows and hit the bookmark button to save them here.
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Link
              href="/movies"
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              Browse Movies
            </Link>
            <Link
              href="/tv"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              Browse TV Shows
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">{posterItems.length} saved</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {posterItems.map((item, i) => (
              <PosterCard key={`${item.media_type}-${item.id}`} item={item} index={i} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
