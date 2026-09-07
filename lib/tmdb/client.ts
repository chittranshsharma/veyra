// Server-only TMDB client. Never import this from a Client Component —
// the read access token must stay on the server.
import "server-only";

// Re-export the shared image helper so server pages only need one import.
export { tmdbImage } from "./image";

const TMDB_BASE = "https://api.themoviedb.org/3";

function authHeaders(): HeadersInit {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN is not set");
  return { Authorization: `Bearer ${token}`, accept: "application/json" };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 3600
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: authHeaders(),
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${url.pathname}`);
  }

  return res.json() as Promise<T>;
}

// ---- Types (trimmed to fields we actually use) ----
export interface TMDBListItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
}

export interface TMDBListResponse {
  page: number;
  results: TMDBListItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBListItem {
  runtime: number;
  genres: TMDBGenre[];
  tagline: string;
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  videos?: { results: { key: string; site: string; type: string }[] };
}

export interface TMDBSeason {
  season_number: number;
  episode_count: number;
  name: string;
  poster_path: string | null;
}

export interface TMDBTVDetails extends TMDBListItem {
  number_of_seasons: number;
  number_of_episodes: number;
  genres: TMDBGenre[];
  seasons: TMDBSeason[];
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  videos?: { results: { key: string; site: string; type: string }[] };
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
}

export interface TMDBSeasonDetails {
  season_number: number;
  episodes: TMDBEpisode[];
}

// ---- Endpoints ----
export const tmdb = {
  trending: (mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") =>
    tmdbFetch<TMDBListResponse>(`/trending/${mediaType}/${timeWindow}`),

  popularMovies: (page = 1) => tmdbFetch<TMDBListResponse>("/movie/popular", { page }),

  popularTV: (page = 1) => tmdbFetch<TMDBListResponse>("/tv/popular", { page }),

  movieDetails: (id: number | string) =>
    tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, { append_to_response: "credits,videos" }),

  tvDetails: (id: number | string) =>
    tmdbFetch<TMDBTVDetails>(`/tv/${id}`, { append_to_response: "credits,videos" }),

  seasonDetails: (tvId: number | string, seasonNumber: number) =>
    tmdbFetch<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch<TMDBListResponse>("/search/multi", { query, page }, 60),

  genres: (mediaType: "movie" | "tv") =>
    tmdbFetch<{ genres: TMDBGenre[] }>(`/genre/${mediaType}/list`, {}, 86400),

  discoverByGenre: (mediaType: "movie" | "tv", genreId: number, page = 1) =>
    tmdbFetch<TMDBListResponse>(`/discover/${mediaType}`, { with_genres: genreId, page }),
};
