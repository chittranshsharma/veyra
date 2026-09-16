import { NextRequest, NextResponse } from "next/server";
import { tmdb, type TMDBListItem } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url?.trim();
    const target = body.target ?? "collection"; // "collection" | "watchlist"
    const customCollectionName = body.collectionName?.trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Please provide a valid URL" }, { status: 400 });
    }

    let targetUrl = rawUrl;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    // Fetch Letterboxd or IMDb HTML
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not reach ${new URL(targetUrl).hostname} (HTTP ${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract list title
    const rawTitleMatch =
      html.match(/<title>([\s\S]*?)<\/title>/i) ||
      html.match(/<h1 class="title-1"[^>]*>([\s\S]*?)<\/h1>/i);
    let listTitle =
      rawTitleMatch && rawTitleMatch[1]
        ? rawTitleMatch[1]
            .replace(/<[^>]+>/g, "")
            .replace(/&lrm;/g, "")
            .replace(/&bull;/g, "")
            .replace(/&mdash;/g, "-")
            .replace(/Letterboxd/gi, "")
            .replace(/•/g, "")
            .trim()
        : "Imported List";
    if (listTitle.endsWith("’s Watchlist") || listTitle.endsWith("'s Watchlist")) {
      listTitle = listTitle.replace(/['’]s Watchlist/i, "'s Favorites");
    }

    // Extract film titles and years
    interface ExtractedFilm {
      title: string;
      year?: string;
      slug: string;
    }

    const extracted: ExtractedFilm[] = [];
    const seen = new Set<string>();

    // Pattern 1: Letterboxd poster container data-target-link + img alt
    const lbMatches = html.matchAll(/data-target-link="\/film\/([^/]+)\/"[\s\S]*?<img[^>]+alt="([^"]+)"/g);
    for (const match of lbMatches) {
      const slug = match[1];
      const title = match[2]?.trim();
      if (slug && title && !seen.has(slug)) {
        seen.add(slug);
        const yearFromSlug = slug.match(/-(\d{4})$/)?.[1];
        extracted.push({ slug, title, year: yearFromSlug });
      }
    }

    // Pattern 2: Fallback for IMDb list (e.g. ipc-title__text or dli-title)
    if (extracted.length === 0) {
      const imdbMatches = html.matchAll(/class="ipc-title__text">(\d+\.\s+)?([^<]+)<\/h3>/g);
      for (const match of imdbMatches) {
        const title = match[2]?.trim();
        if (title && !seen.has(title)) {
          seen.add(title);
          extracted.push({ slug: title.toLowerCase().replace(/[^a-z0-9]/g, "-"), title });
        }
      }
    }

    if (extracted.length === 0) {
      return NextResponse.json(
        {
          error:
            "No movie titles could be found at this link. Please ensure the list is public on Letterboxd or IMDb.",
        },
        { status: 404 }
      );
    }

    // Cap at 40 titles per import to avoid TMDB rate limit / excessive delays
    const itemsToResolve = extracted.slice(0, 40);

    // Resolve each against TMDB in concurrent batches of 5
    const resolvedItems: TMDBListItem[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < itemsToResolve.length; i += BATCH_SIZE) {
      const batch = itemsToResolve.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async ({ title, year }) => {
          try {
            const search = await tmdb.searchMulti(title, 1);
            if (!search.results || search.results.length === 0) return null;

            // Prioritize match with release year if available
            if (year) {
              const yearMatch = search.results.find((item) => {
                const itemYear = item.release_date?.split("-")[0] ?? item.first_air_date?.split("-")[0];
                return itemYear === year;
              });
              if (yearMatch) return yearMatch;
            }

            // Otherwise pick first movie/tv result
            const firstValid = search.results.find(
              (r) => r.media_type === "movie" || r.media_type === "tv" || r.poster_path
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

    // Save to Supabase if user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let savedCollectionId: string | undefined;

    if (user && resolvedItems.length > 0) {
      if (target === "watchlist") {
        // Insert into watchlist
        const watchlistRows = resolvedItems.map((item) => ({
          user_id: user.id,
          tmdb_id: item.id,
          media_type: item.media_type ?? (item.title ? "movie" : "tv"),
          title: item.title ?? item.name ?? "Untitled",
          poster_path: item.poster_path,
        }));
        await supabase.from("watchlist").upsert(watchlistRows, { onConflict: "user_id,tmdb_id,media_type" });
      } else {
        // Create user collection in collections table
        const finalCollectionTitle = customCollectionName || listTitle || "Imported Letterboxd List";
        const { data: newCollection } = await supabase
          .from("collections")
          .insert({
            user_id: user.id,
            name: finalCollectionTitle,
            description: `Imported from ${new URL(targetUrl).hostname} (${resolvedItems.length} titles)`,
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
          await supabase.from("collection_items").insert(itemsToInsert);
        }
      }
    }

    return NextResponse.json({
      success: true,
      listTitle: customCollectionName || listTitle,
      totalParsed: extracted.length,
      resolvedCount: resolvedItems.length,
      items: resolvedItems,
      savedCollectionId,
      target,
    });
  } catch (err) {
    console.error("[Letterboxd Importer] Error:", err);
    return NextResponse.json(
      { error: "Failed to parse and import list. Please verify the URL is public." },
      { status: 500 }
    );
  }
}
