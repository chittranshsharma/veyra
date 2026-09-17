import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata: Metadata = {
  title: "Settings & Preferences — Veyra",
  description: "Configure playback quality, language, privacy, and account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let progressCount = 0;
  let watchlistCount = 0;

  if (user) {
    const [profileRes, progressRes, watchlistRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, avatar_url, created_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("watch_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", false),
      supabase
        .from("watchlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    profile = profileRes.data;
    progressCount = progressRes.count ?? 0;
    watchlistCount = watchlistRes.count ?? 0;
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 pb-32">
      <SettingsClient
        user={user ? { id: user.id, email: user.email } : null}
        profile={profile}
        initialProgressCount={progressCount}
        initialWatchlistCount={watchlistCount}
      />
    </main>
  );
}
