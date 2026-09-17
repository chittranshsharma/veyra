import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const reviewSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  rating: z.number().int().min(1, "Minimum rating is 1").max(10, "Maximum rating is 10"),
  comment: z.string().max(2000, "Review comment cannot exceed 2000 characters").optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const parsed = reviewSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { tmdbId, mediaType, rating, comment } = parsed.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("reviews") as any).upsert(
      {
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        rating,
        comment: comment?.trim() ? comment.trim() : null,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,tmdb_id,media_type",
      }
    ).select().single();

    if (error) {
      console.error("[Reviews POST DB error]:", error.message);
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, review: data });
  } catch (err) {
    console.error("[Reviews POST Unexpected error]:", err);
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, "api");
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Reviews DELETE DB error]:", error.message);
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Reviews DELETE Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
