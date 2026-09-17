import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = (searchParams.get("type") ?? "movie") as "movie" | "tv";
  const page = Number(searchParams.get("page") ?? 1);

  try {
    const data = type === "tv" ? await tmdb.popularTV(page) : await tmdb.popularMovies(page);
    const results = data.results.map((r) => ({ ...r, media_type: type }));
    return NextResponse.json({ results }, { headers: { "Cache-Control": "s-maxage=600" } });
  } catch (err) {
    console.error("Popular route error:", err);
    return NextResponse.json({ results: [], error: "Failed to fetch popular titles" }, { status: 500 });
  }
}
