import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? 8);

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await tmdb.searchMulti(q.trim());
    const results = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, limit);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "s-maxage=60" } });
  } catch (err) {
    console.error("TMDB search error:", err);
    return NextResponse.json({ results: [], error: "Failed to perform search" }, { status: 500 });
  }
}
