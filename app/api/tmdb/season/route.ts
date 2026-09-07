import { NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tvId = searchParams.get("tvId");
  const season = searchParams.get("season");

  if (!tvId || !season) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const data = await tmdb.seasonDetails(Number(tvId), Number(season));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch season" }, { status: 502 });
  }
}
