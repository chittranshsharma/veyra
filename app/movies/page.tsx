import { tmdb } from "@/lib/tmdb/client";
import { Row } from "@/components/movie/Row";
import { GenreFilterBar } from "@/components/movie/GenreFilterBar";
import { NetworkFilterBar, MOVIE_STUDIOS } from "@/components/movie/NetworkFilterBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse popular and trending movies on Veyra.",
};

interface Props {
  searchParams: Promise<{ genre?: string; sort?: string; studio?: string }>;
}

export default async function MoviesPage({ searchParams }: Props) {
  const { genre, sort, studio } = await searchParams;
  const genreId = genre ? Number(genre) : undefined;
  const studioId = studio ? Number(studio) : undefined;
  const sortBy = sort ?? "popularity.desc";

  const [primary, action, comedy, drama] = await Promise.all([
    // Filtered/sorted results for the main row
    (studioId
      ? tmdb.discoverByCompany(studioId, sortBy)
      : genreId
      ? tmdb.discoverWithSort("movie", genreId, sortBy)
      : tmdb.discoverWithSort("movie", undefined, sortBy)
    ).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    tmdb.discoverByGenre("movie", 28).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    tmdb.discoverByGenre("movie", 35).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    tmdb.discoverByGenre("movie", 18).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
  ]);

  const studioName = MOVIE_STUDIOS.find((s) => s.id === studioId)?.label;

  // Build the primary row title based on filters
  const primaryTitle = studioName
    ? `${studioName} Films`
    : genreId
    ? (sortBy === "vote_average.desc"
        ? "Top Rated in Genre"
        : sortBy === "primary_release_date.desc"
        ? "Newest in Genre"
        : "Popular in Genre")
    : (sortBy === "vote_average.desc"
        ? "Top Rated Movies"
        : sortBy === "primary_release_date.desc"
        ? "Newest Movies"
        : "Popular Now");

  return (
    <main className="min-h-screen pb-16 pt-8 space-y-8">
      <div className="px-4 sm:px-8 lg:px-16">
        <h1 className="gradient-heading font-display text-4xl font-bold">Movies</h1>
        <p className="mt-1 text-muted">Browse the latest and greatest films</p>
      </div>

      {/* Studio & Production Filter Bar */}
      <NetworkFilterBar mediaType="movie" activeNetworkId={studioId} />

      {/* Genre & Mood Filter Bar */}
      <GenreFilterBar activeGenre={genreId} activeSort={sortBy} />

      {/* Filtered main row */}
      <Row title={primaryTitle} items={primary.results} defaultMediaType="movie" />

      {/* Always-on genre rails (hidden when a filter is active) */}
      {!genreId && !studioId && (
        <>
          <Row title="💥 Action" items={action.results} defaultMediaType="movie" />
          <Row title="😂 Comedy" items={comedy.results} defaultMediaType="movie" />
          <Row title="🎭 Drama" items={drama.results} defaultMediaType="movie" />
        </>
      )}
    </main>
  );
}
