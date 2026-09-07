const IMAGE_BASE = "https://image.tmdb.org/t/p";

/**
 * Returns a full TMDB image URL for a given path and size.
 * Safe to import from both Server and Client Components.
 */
export function tmdbImage(
  path: string | null | undefined,
  size: "w200" | "w300" | "w500" | "w780" | "w1280" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}
