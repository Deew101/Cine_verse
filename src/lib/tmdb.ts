import { supabase } from "@/integrations/supabase/client";

export const TMDB_IMG = "https://image.tmdb.org/t/p";
export const posterUrl = (path: string | null, size: "w200" | "w342" | "w500" | "original" = "w500") =>
  path ? `${TMDB_IMG}/${size}${path}` : "/placeholder.svg";
export const backdropUrl = (path: string | null, size: "w780" | "w1280" | "original" = "original") =>
  path ? `${TMDB_IMG}/${size}${path}` : "/placeholder.svg";

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  media_type?: string;
}

export interface MovieDetails extends Movie {
  runtime?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  status?: string;
  videos?: { results: { key: string; site: string; type: string; name: string }[] };
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  similar?: { results: Movie[] };
}

export interface Genre { id: number; name: string }

async function tmdb<T = any>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const search = new URLSearchParams({ path, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const { data, error } = await supabase.functions.invoke(`tmdb?${search.toString()}`, { method: "GET" });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const tmdbApi = {
  trending: () => tmdb<{ results: Movie[] }>("trending/all/week"),
  popularMovies: () => tmdb<{ results: Movie[] }>("movie/popular"),
  topRated: () => tmdb<{ results: Movie[] }>("movie/top_rated"),
  nowPlaying: () => tmdb<{ results: Movie[] }>("movie/now_playing"),
  upcoming: () => tmdb<{ results: Movie[] }>("movie/upcoming"),
  popularTV: () => tmdb<{ results: Movie[] }>("tv/popular"),
  topRatedTV: () => tmdb<{ results: Movie[] }>("tv/top_rated"),
  movieGenres: () => tmdb<{ genres: Genre[] }>("genre/movie/list"),
  discover: (params: Record<string, string | number> = {}) =>
    tmdb<{ results: Movie[]; total_pages: number }>("discover/movie", params),
  search: (query: string) => tmdb<{ results: Movie[] }>("search/multi", { query, include_adult: "false" }),
  details: (type: "movie" | "tv", id: number) =>
    tmdb<MovieDetails>(`${type}/${id}`, { append_to_response: "videos,credits,similar" }),
};
