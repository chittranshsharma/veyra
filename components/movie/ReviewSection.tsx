"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Trash2, Send, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

export interface ReviewItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string | null;
  } | null;
}

interface ReviewSectionProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  currentUserId?: string | null;
  initialReviews: ReviewItem[];
}

export function ReviewSection({
  tmdbId,
  mediaType,
  currentUserId,
  initialReviews,
}: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(8);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingUserReview = currentUserId
    ? reviews.find((r) => r.user_id === currentUserId)
    : undefined;

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit review");
      }

      setComment("");
      router.refresh();

      // Optimistically update or prepend review
      if (data.review) {
        setReviews((prev) => {
          const filtered = prev.filter((r) => r.user_id !== currentUserId);
          return [data.review, ...filtered];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    setError(null);
    setDeletingId(reviewId);

    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete review");
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-14 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-accent" size={24} />
          <h2 className="font-display text-2xl font-bold text-text-primary">
            User Reviews
          </h2>
          <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-semibold text-muted">
            {reviews.length}
          </span>
        </div>

        {averageRating && (
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-3.5 py-1.5">
            <Star size={16} className="fill-accent text-accent" />
            <span className="text-sm font-bold text-text-primary">{averageRating}</span>
            <span className="text-xs text-muted">/ 10 Veyra Community</span>
          </div>
        )}
      </div>

      {/* Review submission or Login CTA */}
      {currentUserId ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {existingUserReview ? "Update Your Review" : "Write a Review"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Rating selector (1 to 10) */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">
                Your Rating:{" "}
                <span className="text-base font-bold text-text-primary ml-1">
                  {hoverRating ?? rating}
                </span>{" "}
                / 10
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(null)}
                    className={`h-9 w-9 rounded-lg text-sm font-bold transition flex items-center justify-center border ${
                      (hoverRating ?? rating) >= val
                        ? "bg-accent text-[var(--on-accent)] border-accent scale-105 shadow-md shadow-accent/20"
                        : "bg-surface2 text-muted border-border hover:border-accent/40 hover:text-text-primary"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  existingUserReview?.comment
                    ? `Current review: "${existingUserReview.comment}". Leave blank to keep or type to update...`
                    : "Share your thoughts about the movie or show (optional)..."
                }
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-border bg-surface2/50 p-3 text-sm text-text-primary placeholder:text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {comment.length}/2000 characters
              </span>
              <button
                type="submit"
                disabled={submitting}
                className={buttonVariants({ variant: "primary", size: "md" })}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {existingUserReview ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface/40 p-5">
          <p className="text-sm text-muted">
            Want to share your rating and review?
          </p>
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Sign In to Review
          </Link>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-surface/20 py-12 text-center text-muted text-sm">
            No reviews yet for this title. Be the first to share your review!
          </div>
        ) : (
          reviews.map((rev) => {
            const isAuthor = rev.user_id === currentUserId;
            const authorName =
              rev.profiles?.username || (isAuthor ? "You" : "Veyra User");
            const dateStr = new Date(rev.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
                      {authorName[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {authorName}{" "}
                        {isAuthor && (
                          <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">{dateStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg bg-surface2 px-2.5 py-1 text-xs font-bold text-text-primary border border-border">
                      <Star size={13} className="fill-accent text-accent" />
                      <span>{rev.rating}/10</span>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(rev.id)}
                        disabled={deletingId === rev.id}
                        title="Delete review"
                        className="text-muted transition hover:text-red-400 p-1"
                      >
                        {deletingId === rev.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {rev.comment && (
                  <p className="mt-3 text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap pl-12">
                    {rev.comment}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
