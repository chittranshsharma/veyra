const IMAGE_BASE =
  process.env.NEXT_PUBLIC_MEDIA_IMAGE_BASE ||
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ||
  "https://image.tmdb.org/t/p";

/**
 * Returns a full media image URL for a given path and size.
 * Next.js <Image> automatically proxies and optimizes this via /_next/image,
 * ensuring fast delivery, WebP conversion, and immunity against client ISP restrictions.
 * Safe to import from both Server and Client Components.
 */
export type TMDBImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w200"
  | "w300"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

export function tmdbImage(
  path: string | null | undefined,
  size: TMDBImageSize = "w500"
): string | null {
  if (!path) return null;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${IMAGE_BASE}/${size}${cleanPath}`;
}
