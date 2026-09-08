import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ collections: [], addedCollectionIds: [] });
  }

  // Get tmdbId and mediaType from query params for the "already added" check
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const mediaType = searchParams.get("mediaType");

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  let addedCollectionIds: string[] = [];
  if (tmdbId && mediaType && collections && collections.length > 0) {
    const collectionIds = collections.map((c) => c.id);
    const { data: items } = await supabase
      .from("collection_items")
      .select("collection_id")
      .in("collection_id", collectionIds)
      .eq("tmdb_id", Number(tmdbId))
      .eq("media_type", mediaType);
    addedCollectionIds = (items ?? []).map((i) => i.collection_id);
  }

  return NextResponse.json({ collections: collections ?? [], addedCollectionIds });
}
