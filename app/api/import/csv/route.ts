import { NextRequest, NextResponse } from "next/server";
import { parseLetterboxdCSV } from "@/lib/import/csv-parser";
import { tmdb, type TMDBListItem } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const { success } = await checkRateLimit(`import-csv:${ip}`, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many import requests. Please wait a moment." }, { status: 429 });
    }

    let csvContent = "";
    let target = "collection";
    let customCollectionName = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      target = (formData.get("target") as string) || "collection";
      customCollectionName = (formData.get("collectionName") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "Please upload a valid CSV file." }, { status: 400 });
      }

      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds 2MB limit." }, { status: 400 });
      }

      csvContent = await file.text();
    } else {
      const body = await req.json();
      csvContent = body.csvContent || "";
      target = body.target || "collection";
      customCollectionName = body.collectionName || "";
    }

    const parseResult = parseLetterboxdCSV(csvContent);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    // Resolve against TMDB in concurrent batches of 5
    const resolvedItems: TMDBListItem[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < parseResult.films.length; i += BATCH_SIZE) {
      const batch = parseResult.films.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async ({ title, year }) => {
          try {
            const search = await tmdb.searchMulti(title, 1);
            if (!search.results || search.results.length === 0) return null;

            if (year) {
              const yearMatch = search.results.find((item) => {
                const itemYear = item.release_date?.split("-")[0] ?? item.first_air_date?.split("-")[0];
                return itemYear === year;
              });
              if (yearMatch) return yearMatch;
            }

            const firstValid = search.results.find(
              (r) => (r.media_type === "movie" || r.media_type === "tv") && (r.poster_path || r.backdrop_path)
            );
            return firstValid ?? search.results[0] ?? null;
          } catch {
            return null;
          }
        })
      );

      for (const r of batchResults) {
        if (r && !resolvedItems.some((existing) => existing.id === r.id)) {
          resolvedItems.push(r);
        }
      }
    }

    // Save to Supabase if authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let savedCollectionId: string | undefined;

    if (user && resolvedItems.length > 0) {
      if (target === "watchlist") {
        const watchlistRows = resolvedItems.map((item) => ({
          user_id: user.id,
          tmdb_id: item.id,
          media_type: item.media_type ?? (item.title ? "movie" : "tv"),
          title: item.title ?? item.name ?? "Untitled",
          poster_path: item.poster_path,
        }));
        await supabase.from("watchlist").upsert(watchlistRows, { onConflict: "user_id,tmdb_id,media_type" });
      } else {
        const title = customCollectionName.trim() || `Letterboxd Import (${new Date().toLocaleDateString()})`;
        const { data: newCollection } = await supabase
          .from("collections")
          .insert({
            user_id: user.id,
            name: title,
            description: `Imported from CSV (${resolvedItems.length} titles resolved)`,
            is_public: true,
          })
          .select("id")
          .single();

        if (newCollection) {
          savedCollectionId = newCollection.id;
          const itemsToInsert = resolvedItems.map((item) => ({
            collection_id: newCollection.id,
            tmdb_id: item.id,
            media_type: item.media_type ?? (item.title ? "movie" : "tv"),
            title: item.title ?? item.name ?? "Untitled",
            poster_path: item.poster_path,
          }));
          await supabase.from("collection_items").upsert(itemsToInsert, { onConflict: "collection_id,tmdb_id,media_type" });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalParsed: parseResult.totalParsed,
      skippedDuplicates: parseResult.skippedDuplicates,
      resolvedCount: resolvedItems.length,
      items: resolvedItems,
      savedCollectionId,
      target,
    });
  } catch (err) {
    console.error("[CSV Importer] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to process CSV file." }, { status: 500 });
  }
}
