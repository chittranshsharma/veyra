"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) throw new Error("Forbidden: Admin privileges required");

  return user;
}

export async function addFeaturedTitleAction(formData: FormData) {
  const user = await verifyAdminCaller();

  const tmdbId = Number(formData.get("tmdbId"));
  const mediaType = String(formData.get("mediaType")) as "movie" | "tv";
  const title = String(formData.get("title") || "");
  const posterPath = String(formData.get("posterPath") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!tmdbId || !mediaType) {
    return { success: false, error: "Invalid title data" };
  }

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient.from("featured_titles") as any).upsert(
    {
      tmdb_id: tmdbId,
      media_type: mediaType,
      title: title || null,
      poster_path: posterPath || null,
      added_by: user.id,
      sort_order: sortOrder,
    },
    { onConflict: "tmdb_id,media_type" }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteFeaturedTitleAction(id: string) {
  await verifyAdminCaller();

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("featured_titles")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteReviewAdminAction(reviewId: string) {
  await verifyAdminCaller();

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
