import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { tmdbImage } from "@/lib/tmdb/image";
import { Plus, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Collections",
  description: "Discover curated movie and TV show collections on Veyra.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch public collections with their items (for cover mosaic)
  const { data: collections } = await supabase
    .from("collections")
    .select(
      `id, name, description, created_at, user_id,
       profiles(username),
       collection_items(poster_path, title)`
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="min-h-screen pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="gradient-heading font-display text-4xl font-bold">Collections</h1>
            <p className="mt-1 text-muted">
              Curated lists of movies and TV shows from the community
            </p>
          </div>
          {user && (
            <Link
              href="/collections/new"
              className="btn-shimmer flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
            >
              <Plus size={16} />
              New List
            </Link>
          )}
        </div>

        {/* Collections grid */}
        {collections && collections.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => {
              const items = (col.collection_items as unknown as { poster_path: string | null; title: string | null }[]) ?? [];
              const covers = items.filter((i) => i.poster_path).slice(0, 4);
              const author = (col.profiles as { username?: string } | null)?.username ?? "Veyra User";

              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="glow-card group overflow-hidden rounded-2xl bg-surface ring-1 ring-white/5"
                >
                  {/* 2x2 poster mosaic */}
                  <div className="relative h-40 w-full overflow-hidden bg-surface2">
                    {covers.length > 0 ? (
                      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => {
                          const cover = covers[i];
                          return (
                            <div key={i} className="relative overflow-hidden bg-surface2">
                              {cover ? (
                                <Image
                                  src={tmdbImage(cover.poster_path, "w200")!}
                                  alt={cover.title ?? ""}
                                  fill
                                  sizes="150px"
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <BookOpen size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-white transition group-hover:text-accent line-clamp-1">
                      {col.name}
                    </p>
                    {col.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{col.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                      <span>by {author}</span>
                      <span>·</span>
                      <span>{items.length} title{items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center gap-4 text-center">
            <BookOpen size={48} className="text-muted" />
            <p className="text-lg font-semibold text-white">No collections yet</p>
            <p className="text-sm text-muted">Be the first to create a curated list!</p>
            {user && (
              <Link
                href="/collections/new"
                className="btn-shimmer mt-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:brightness-110"
              >
                Create a Collection
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
