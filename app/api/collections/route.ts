import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const addSchema = z.object({
  collectionId: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().optional(),
  posterPath: z.string().nullable().optional(),
});

const removeSchema = z.object({
  collectionId: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await checkRateLimit(user.id, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { collectionId, tmdbId, mediaType, title, posterPath } = parsed.data;

    // Verify the user owns this collection
    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const { error } = await supabase.from("collection_items").upsert(
      {
        collection_id: collectionId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title: title ?? null,
        poster_path: posterPath ?? null,
      },
      { onConflict: "collection_id,tmdb_id,media_type" }
    );

    if (error) {
      console.error("[Collection Add DB error]:", error.message);
      return NextResponse.json({ error: "Failed to add item to collection" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Collection Add Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await checkRateLimit(user.id, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = removeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { collectionId, tmdbId, mediaType } = parsed.data;

    // Verify the user owns this collection
    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType);

    if (error) {
      console.error("[Collection Remove DB error]:", error.message);
      return NextResponse.json({ error: "Failed to remove item from collection" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Collection Remove Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
