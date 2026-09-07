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

  const json = await request.json();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, review: data });
}

export async function DELETE(request: Request) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
