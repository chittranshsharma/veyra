import { tmdb } from "@/lib/tmdb/client";
import { Row } from "@/components/movie/Row";
import { GenreFilterBar } from "@/components/movie/GenreFilterBar";
import { NetworkFilterBar } from "@/components/movie/NetworkFilterBar";
import { TV_NETWORKS } from "@/lib/tmdb/networks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Browse popular and trending TV shows on Veyra.",
};

interface Props {
  searchParams: Promise<{ genre?: string; sort?: string; network?: string }>;
}

export default async function TVPage({ searchParams }: Props) {
  const { genre, sort, network } = await searchParams;
  const genreId = genre ? Number(genre) : undefined;
  const networkId = network ? Number(network) : undefined;
  const sortBy = sort ?? "popularity.desc";

  const [primary, drama, scifi, crime] = await Promise.all([
    (networkId
      ? tmdb.discoverByNetwork(networkId, sortBy)
      : genreId
      ? tmdb.discoverWithSort("tv", genreId, sortBy)
      : tmdb.discoverWithSort("tv", undefined, sortBy)
    ).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    tmdb.discoverByGenre("tv", 18).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    tmdb.discoverByGenre("tv", 10765).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    tmdb.discoverByGenre("tv", 80).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
  ]);

  const networkName = TV_NETWORKS.find((n) => n.id === networkId)?.label;

  const primaryTitle = networkName
    ? `${networkName} Series`
    : genreId
    ? (sortBy === "vote_average.desc"
        ? "Top Rated in Genre"
        : sortBy === "primary_release_date.desc"
        ? "Newest in Genre"
        : "Popular in Genre")
    : (sortBy === "vote_average.desc"
        ? "Top Rated Shows"
        : sortBy === "primary_release_date.desc"
        ? "Newest Shows"
        : "Popular Now");

  return (
    <main className="min-h-screen pb-32 pt-8 space-y-8">
      <div className="px-4 sm:px-8 lg:px-16">
        <h1 className="gradient-heading font-display text-4xl font-bold">TV Shows</h1>
        <p className="mt-1 text-muted">Stream the latest episodes</p>
      </div>

      {/* Network & Platform Filter Bar */}
      <NetworkFilterBar mediaType="tv" activeNetworkId={networkId} />

      {/* Genre & Mood Filter Bar */}
      <GenreFilterBar activeGenre={genreId} activeSort={sortBy} />

      {/* Filtered main row */}
      <Row title={primaryTitle} items={primary.results} defaultMediaType="tv" />

      {/* Always-on genre rails (hidden when a filter is active) */}
      {!genreId && !networkId && (
        <>
          <Row title="🎭 Drama" items={drama.results} defaultMediaType="tv" />
          <Row title="🚀 Sci-Fi & Fantasy" items={scifi.results} defaultMediaType="tv" />
          <Row title="🕵️ Crime" items={crime.results} defaultMediaType="tv" />
        </>
      )}
    </main>
  );
}
