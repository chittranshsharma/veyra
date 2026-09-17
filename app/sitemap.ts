import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://veyra.movie";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tv`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/import`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Try fetching popular movies and shows from TMDB for rich sitemap coverage
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (tmdbApiKey) {
      const [moviesRes, tvRes] = await Promise.allSettled([
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`, {
          next: { revalidate: 86400 },
        }),
        fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbApiKey}`, {
          next: { revalidate: 86400 },
        }),
      ]);

      const dynamicUrls: MetadataRoute.Sitemap = [];

      if (moviesRes.status === "fulfilled" && moviesRes.value.ok) {
        const moviesData = await moviesRes.value.json();
        for (const item of (moviesData.results || []).slice(0, 50)) {
          if (item?.id) {
            dynamicUrls.push({
              url: `${baseUrl}/movie/${item.id}`,
              lastModified: now,
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        }
      }

      if (tvRes.status === "fulfilled" && tvRes.value.ok) {
        const tvData = await tvRes.value.json();
        for (const item of (tvData.results || []).slice(0, 50)) {
          if (item?.id) {
            dynamicUrls.push({
              url: `${baseUrl}/tv/${item.id}`,
              lastModified: now,
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        }
      }

      return [...staticRoutes, ...dynamicUrls];
    }
  } catch {
    // If external TMDB fetch fails during build/render, gracefully return static routes
  }

  return staticRoutes;
}
