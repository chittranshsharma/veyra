import { tmdb } from "@/lib/tmdb/client";
import { Row } from "@/components/movie/Row";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Browse popular and trending TV shows on Veyra.",
};

export default async function TVPage() {
  const [popular, drama, scifi, crime] = await Promise.all([
    tmdb.popularTV(),
    tmdb.discoverByGenre("tv", 18),   // Drama
    tmdb.discoverByGenre("tv", 10765), // Sci-Fi & Fantasy
    tmdb.discoverByGenre("tv", 80),   // Crime
  ]);

  return (
    <main className="min-h-screen pb-16 pt-8 space-y-10">
      <div className="px-4 sm:px-8 lg:px-16">
        <h1 className="font-display text-4xl font-bold text-white">TV Shows</h1>
        <p className="mt-1 text-muted">Stream the latest episodes</p>
      </div>

      <Row title="Popular Now" items={popular.results} defaultMediaType="tv" />
      <Row title="Drama" items={drama.results} defaultMediaType="tv" />
      <Row title="Sci-Fi & Fantasy" items={scifi.results} defaultMediaType="tv" />
      <Row title="Crime" items={crime.results} defaultMediaType="tv" />
    </main>
  );
}
