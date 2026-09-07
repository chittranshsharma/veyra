import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Users, Star, Film, ShieldCheck } from "lucide-react";
import { DeleteReviewButton, DeleteFeaturedButton, AddFeaturedForm } from "@/components/admin/AdminControls";

export const metadata: Metadata = {
  title: "Admin Dashboard — Veyra",
  robots: { index: false, follow: false },
};

interface AdminReview {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { username?: string } | null;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("is_admin, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!currentProfile?.is_admin) {
    redirect("/");
  }

  // Use service client securely on server side only
  const serviceClient = createServiceClient();

  // 1. Fetch recent signups (profiles + auth emails)
  const { data: profiles } = await serviceClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  let userEmailMap: Record<string, string> = {};
  try {
    const { data: authUsers } = await serviceClient.auth.admin.listUsers({
      perPage: 50,
    });
    if (authUsers?.users) {
      userEmailMap = Object.fromEntries(
        authUsers.users.map((u) => [u.id, u.email ?? "—"])
      );
    }
  } catch (err) {
    console.error("Admin user list error:", err);
  }

  // 2. Fetch recent reviews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawReviews } = await (serviceClient.from("reviews") as any)
    .select("*, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(20);
  const recentReviews = (rawReviews ?? []) as AdminReview[];

  // 3. Fetch featured titles
  const { data: featuredTitles } = await serviceClient
    .from("featured_titles")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl min-h-screen px-4 py-12 sm:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-accent text-sm font-semibold mb-1">
            <ShieldCheck size={16} />
            <span>Admin Console</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            System Administration
          </h1>
          <p className="text-sm text-muted mt-1">
            Welcome, {currentProfile.username || user.email}
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {/* Featured Titles Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-display text-xl font-semibold">
            <Film size={20} className="text-accent" />
            <h2>Featured Titles Management</h2>
          </div>
          <p className="text-xs text-muted">
            Add or curate titles featured on the homepage rails & hero banner.
          </p>

          <AddFeaturedForm />

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-surface2 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">TMDB ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!featuredTitles || featuredTitles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted">
                      No custom featured titles yet. Homepage will fall back to TMDB trending.
                    </td>
                  </tr>
                ) : (
                  featuredTitles.map((ft) => (
                    <tr key={ft.id} className="hover:bg-surface2/50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-accent">
                        #{ft.sort_order}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white">
                        {ft.tmdb_id}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase font-semibold text-muted">
                        {ft.media_type}
                      </td>
                      <td className="px-4 py-3 text-xs text-white font-medium">
                        {ft.title || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteFeaturedButton id={ft.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Signups */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-display text-xl font-semibold">
            <Users size={20} className="text-accent" />
            <h2>Recent Signups</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-surface2 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!profiles || profiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-surface2/50 transition">
                      <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                          {p.username?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        {p.username}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {userEmailMap[p.id] ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            p.is_admin
                              ? "bg-accent/20 text-accent border border-accent/30"
                              : "bg-surface2 text-muted"
                          }`}
                        >
                          {p.is_admin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reviews Moderation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-display text-xl font-semibold">
            <Star size={20} className="text-accent" />
            <h2>Review Moderation</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-surface2 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Title ID</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!recentReviews || recentReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted">
                      No user reviews have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  recentReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-surface2/50 transition">
                      <td className="px-4 py-3 text-xs font-semibold text-white">
                        {rev.profiles?.username || rev.user_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {rev.media_type}:{rev.tmdb_id}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-accent">
                        ★ {rev.rating}/10
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-300 max-w-xs truncate">
                        {rev.comment || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteReviewButton reviewId={rev.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
