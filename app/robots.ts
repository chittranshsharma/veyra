import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://veyra.movie";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/tv", "/movie/", "/tv/", "/collections", "/search", "/import"],
        disallow: ["/api/", "/settings", "/auth/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
