import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { progressUpsertSchema } from "@/lib/validation/progress";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { Database } from "@/types/database";

type WatchProgressInsert =
  Database["public"]["Tables"]["watch_progress"]["Insert"];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    const parsed = progressUpsertSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
    }

    const { tmdbId, mediaType, season, episode, progressSeconds, durationSeconds, progressPercent } =
      parsed.data;

    const payload: WatchProgressInsert = {
      user_id: user.id,
      tmdb_id: tmdbId,
      media_type: mediaType,
      season: season ?? null,
      episode: episode ?? null,
      progress_seconds: progressSeconds,
      duration_seconds: durationSeconds,
      progress_percent: progressPercent,
      completed: progressPercent >= 95,
      last_watched_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("watch_progress")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(payload as any, {
        onConflict: "user_id,tmdb_id,media_type,season,episode",
      });

    if (error) {
      console.error("[Progress POST DB error]:", error.message);
      return NextResponse.json({ error: "Failed to update watch progress" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Progress POST Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id, "api");
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    const { error } = await supabase
      .from("watch_progress")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("[Progress DELETE DB error]:", error.message);
      return NextResponse.json({ error: "Failed to clear watch progress" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Progress DELETE Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
