import { tmdb } from "@/lib/tmdb/client";
import type { TMDBListItem } from "@/lib/tmdb/client";
import { SearchInput } from "@/components/search/SearchInput";
import { PosterCard } from "@/components/movie/PosterCard";
import { SearchIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for movies and TV shows on Veyra.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let results: TMDBListItem[] = [];
  if (query.length >= 2) {
    const data = await tmdb.searchMulti(query);
    results = data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );
  }

  return (
    <main className="mx-auto max-w-7xl min-h-screen px-4 py-8 sm:px-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-white">Search</h1>

      <SearchInput defaultValue={query} />

      {query.length >= 2 ? (
        <div className="mt-8">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <SearchIcon size={48} className="text-muted/40" />
              <div>
                <p className="text-lg font-semibold text-white">No results found</p>
                <p className="mt-1 text-sm text-muted">
                  Try a different search term.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted">
                {results.length} results for &ldquo;{query}&rdquo;
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((item, i) => (
                  <PosterCard key={`${item.media_type}-${item.id}`} item={item} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <SearchIcon size={48} className="text-muted/40" />
          <div>
            <p className="text-lg font-semibold text-white">
              Find your next watch
            </p>
            <p className="mt-1 text-sm text-muted">
              Search for movies, TV shows, and more.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
