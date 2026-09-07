import { tmdb } from "@/lib/tmdb/client";
import { Row } from "@/components/movie/Row";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse popular and trending movies on Veyra.",
};

export default async function MoviesPage() {
  const [popular, topRated, action, comedy] = await Promise.all([
    tmdb.popularMovies(),
    tmdb.discoverByGenre("movie", 28), // Action
    tmdb.discoverByGenre("movie", 35), // Comedy
    tmdb.discoverByGenre("movie", 18), // Drama
  ]);

  return (
    <main className="min-h-screen pb-16 pt-8 space-y-10">
      <div className="px-4 sm:px-8 lg:px-16">
        <h1 className="font-display text-4xl font-bold text-white">Movies</h1>
        <p className="mt-1 text-muted">Browse the latest and greatest films</p>
      </div>

      <Row title="Popular Now" items={popular.results} defaultMediaType="movie" />
      <Row title="Action" items={action.results} defaultMediaType="movie" />
      <Row title="Comedy" items={comedy.results} defaultMediaType="movie" />
      <Row title="Drama" items={topRated.results} defaultMediaType="movie" />
    </main>
  );
}
