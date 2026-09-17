import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const watchlistSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1).max(500),
  posterPath: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting (20 req / 10s sliding window)
    const rateLimit = await checkRateLimit(user.id, "api");
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = watchlistSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { tmdbId, mediaType, title, posterPath } = parsed.data;

    const { error } = await supabase.from("watchlist").upsert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title,
        poster_path: posterPath ?? null,
      } as any
    );

    if (error) {
      console.error("[Watchlist POST DB error]:", error.message);
      return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Watchlist POST Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting (20 req / 10s sliding window)
    const rateLimit = await checkRateLimit(user.id, "api");
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    const { searchParams } = new URL(request.url);
    const tmdbId = Number(searchParams.get("tmdbId"));
    const mediaType = searchParams.get("mediaType");

    if (!tmdbId || !mediaType) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType);

    if (error) {
      console.error("[Watchlist DELETE DB error]:", error.message);
      return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Watchlist DELETE Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
