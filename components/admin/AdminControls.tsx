"use client";

import { useState } from "react";
import { addFeaturedTitleAction, deleteFeaturedTitleAction, deleteReviewAdminAction } from "@/app/admin/actions";
import { Trash2, Plus, Loader2, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this review as moderator?")) return;
    setLoading(true);
    await deleteReviewAdminAction(reviewId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={buttonVariants({ variant: "danger", size: "xs" })}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Delete
    </button>
  );
}

export function DeleteFeaturedButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this title from featured list?")) return;
    setLoading(true);
    await deleteFeaturedTitleAction(id);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={buttonVariants({ variant: "danger", size: "xs" })}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Remove
    </button>
  );
}

export function AddFeaturedForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await addFeaturedTitleAction(formData);

    if (res?.success) {
      form.reset();
      setMsg("Featured title saved successfully!");
    } else {
      setMsg(res?.error ?? "Failed to add featured title");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-white/10 bg-surface/50 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Media ID *</label>
          <input
            name="tmdbId"
            type="number"
            required
            placeholder="e.g. 550"
            className="w-full rounded-lg border border-white/10 bg-surface2 px-3 py-2 text-xs text-white placeholder:text-muted focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Media Type *</label>
          <select
            name="mediaType"
            required
            className="w-full rounded-lg border border-white/10 bg-surface2 px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="movie">Movie</option>
            <option value="tv">TV Series</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Title</label>
          <input
            name="title"
            type="text"
            placeholder="Title (optional)"
            className="w-full rounded-lg border border-white/10 bg-surface2 px-3 py-2 text-xs text-white placeholder:text-muted focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Sort Order</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="w-full rounded-lg border border-white/10 bg-surface2 px-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        {msg && <span className="text-xs text-accent">{msg}</span>}
        <button
          type="submit"
          disabled={loading}
          className={buttonVariants({ variant: "primary", size: "sm", className: "ml-auto" })}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add to Featured
        </button>
      </div>
    </form>
  );
}
