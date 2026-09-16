// Server-only cinema catalog client. Never import this from a Client Component —
// the read access token must stay on the server.
import "server-only";

// Re-export the shared image helper so server pages only need one import.
export { tmdbImage } from "./image";

const TMDB_BASE = "https://api.themoviedb.org/3";

function authHeaders(): HeadersInit {
  const token =
    process.env.CINEMA_API_KEY ||
    process.env.MEDIA_API_KEY ||
    process.env.TMDB_READ_ACCESS_TOKEN ||
    process.env.TMDB_API_KEY;
  if (!token) throw new Error("Catalog access token is not configured");
  return { Authorization: `Bearer ${token}`, accept: "application/json" };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 3600,
  retries = 2
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: authHeaders(),
        next: { revalidate: revalidateSeconds },
      });

      if (!res.ok) {
        throw new Error(`Catalog request failed: ${res.status} ${url.pathname}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === retries) throw err;
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 250));
    }
  }

  throw new Error(`Catalog request failed after ${retries} retries`);
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
  external_ids?: { imdb_id?: string; [key: string]: any };
}

export interface TMDBPersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  combined_credits: {
    cast: (TMDBListItem & { character: string; order: number; popularity: number })[]
    crew: (TMDBListItem & { job: string; department: string; popularity: number })[]
  };
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
    tmdbFetch<TMDBTVDetails>(`/tv/${id}`, { append_to_response: "credits,videos,external_ids" }),

  seasonDetails: (tvId: number | string, seasonNumber: number) =>
    tmdbFetch<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch<TMDBListResponse>("/search/multi", { query, page }, 60),

  genres: (mediaType: "movie" | "tv") =>
    tmdbFetch<{ genres: TMDBGenre[] }>(`/genre/${mediaType}/list`, {}, 86400),

  discoverByGenre: (mediaType: "movie" | "tv", genreId: number, page = 1) =>
    tmdbFetch<TMDBListResponse>(`/discover/${mediaType}`, { with_genres: genreId, page }),

  discoverWithSort: (
    mediaType: "movie" | "tv",
    genreId?: number,
    sortBy: string = "popularity.desc",
    page = 1
  ) =>
    tmdbFetch<TMDBListResponse>(`/discover/${mediaType}`, {
      ...(genreId ? { with_genres: genreId } : {}),
      sort_by: sortBy,
      page,
    }),

  personDetails: (id: number | string) =>
    tmdbFetch<TMDBPersonDetails>(`/person/${id}`, { append_to_response: "combined_credits" }),

  discoverByNetwork: (networkId: number, sortBy = "popularity.desc", page = 1) =>
    tmdbFetch<TMDBListResponse>("/discover/tv", {
      with_networks: networkId,
      sort_by: sortBy,
      page,
    }),

  discoverByCompany: (companyId: number, sortBy = "popularity.desc", page = 1) =>
    tmdbFetch<TMDBListResponse>("/discover/movie", {
      with_companies: companyId,
      sort_by: sortBy,
      page,
    }),

  batchDetails: async (
    items: { id: number; media_type: "movie" | "tv" }[]
  ): Promise<(TMDBListItem & { media_type: "movie" | "tv" })[]> => {
    const list: (TMDBListItem & { media_type: "movie" | "tv" })[] = [];
    for (const item of items) {
      try {
        if (item.media_type === "movie") {
          const m = await tmdb.movieDetails(item.id);
          list.push({
            id: m.id,
            title: m.title,
            poster_path: m.poster_path,
            backdrop_path: m.backdrop_path,
            overview: m.overview,
            vote_average: m.vote_average,
            release_date: m.release_date,
            media_type: "movie",
          });
        } else {
          const t = await tmdb.tvDetails(item.id);
          list.push({
            id: t.id,
            name: t.name,
            poster_path: t.poster_path,
            backdrop_path: t.backdrop_path,
            overview: t.overview,
            vote_average: t.vote_average,
            first_air_date: t.first_air_date,
            media_type: "tv",
          });
        }
      } catch {
        // Skip items that fail to resolve
      }
    }
    return list;
  },
};

