import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PosterCard } from "@/components/movie/PosterCard";
import type { TMDBListItem } from "@/lib/tmdb/client";
import { Globe, Lock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("name, description")
    .eq("id", id)
    .maybeSingle();
  return {
    title: data?.name ?? "Collection",
    description: data?.description ?? undefined,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: collection } = await supabase
    .from("collections")
    .select(
      `id, name, description, is_public, created_at, user_id,
       profiles(username),
       collection_items(id, tmdb_id, media_type, title, poster_path, added_at)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!collection) {
    notFound();
  }

  // Access check: private collections only visible to owner
  if (!collection.is_public && collection.user_id !== user?.id) {
    notFound();
  }

  const items = (collection.collection_items as unknown as {
    id: string;
    tmdb_id: number;
    media_type: string;
    title: string | null;
    poster_path: string | null;
    added_at: string;
  }[]) ?? [];

  const author = (collection.profiles as { username?: string } | null)?.username ?? "Veyra User";
  const isOwner = user?.id === collection.user_id;

  // Shape items into TMDBListItem for PosterCard
  const posterItems: TMDBListItem[] = items.map((item) => ({
    id: item.tmdb_id,
    title: item.title ?? undefined,
    name: item.media_type === "tv" ? (item.title ?? undefined) : undefined,
    poster_path: item.poster_path,
    backdrop_path: null,
    overview: "",
    vote_average: 0,
    media_type: item.media_type as "movie" | "tv",
  }));

  return (
    <main className="min-h-screen pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {collection.is_public ? (
              <Globe size={14} className="text-accent" />
            ) : (
              <Lock size={14} className="text-muted" />
            )}
            <span className="text-xs text-muted">by {author}</span>
          </div>
          <h1 className="gradient-heading font-display text-4xl font-bold">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="max-w-2xl text-muted">{collection.description}</p>
          )}
          <p className="text-sm text-muted">
            {items.length} title{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Items grid */}
        {posterItems.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-4">
            {posterItems.map((item, i) => (
              <PosterCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                defaultMediaType={item.media_type as "movie" | "tv"}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center text-muted">
            <p>This collection is empty. Add some titles from movie or TV pages.</p>
          </div>
        )}
      </div>
    </main>
  );
}
