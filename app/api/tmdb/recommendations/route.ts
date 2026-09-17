import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

function authHeaders() {
  const token =
    process.env.CINEMA_API_KEY ||
    process.env.MEDIA_API_KEY ||
    process.env.TMDB_READ_ACCESS_TOKEN ||
    process.env.TMDB_API_KEY;
  if (!token) throw new Error("Catalog access token is not configured");
  return { Authorization: `Bearer ${token}`, accept: "application/json" };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const type = (searchParams.get("type") ?? "movie") as "movie" | "tv";

  if (!id) return NextResponse.json({ results: [] });

  try {
    const path = `${TMDB_BASE}/${type}/${id}/recommendations`;
    const res = await fetch(path, {
      headers: authHeaders(),
      next: { revalidate: 1800 },
    });
    const data = await res.json();
    const results = (data.results ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      media_type: type,
    }));
    return NextResponse.json({ results }, { headers: { "Cache-Control": "s-maxage=1800" } });
  } catch (err) {
    console.error("Recommendations route error:", err);
    return NextResponse.json({ results: [], error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
