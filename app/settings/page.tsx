import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { UserCircle, Mail, Calendar } from "lucide-react";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <main className="mx-auto max-w-2xl min-h-screen px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-white">Settings</h1>

      <div className="mt-8 space-y-4">
        {/* Profile card */}
        <div className="rounded-2xl bg-surface p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent ring-2 ring-accent/30">
              {profile?.username?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-white">
                {profile?.username ?? "—"}
              </p>
              <p className="text-sm text-muted">@{profile?.username ?? "unknown"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-surface2 px-4 py-3">
              <Mail size={16} className="text-muted" />
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-surface2 px-4 py-3">
              <Calendar size={16} className="text-muted" />
              <div>
                <p className="text-xs text-muted">Member since</p>
                <p className="text-sm font-medium text-white">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="rounded-2xl bg-surface p-6">
          <h2 className="mb-4 font-semibold text-white">Account Actions</h2>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
