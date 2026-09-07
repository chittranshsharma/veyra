"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function TVError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertTriangle size={48} className="text-yellow-500/60" />
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-white">
          Couldn&apos;t load this show
        </h2>
        <p className="text-sm text-muted">
          The TV show may not exist or TMDB is temporarily unavailable.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
        >
          Retry
        </button>
        <Link
          href="/tv"
          className="rounded-xl bg-surface px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-surface2"
        >
          Browse TV Shows
        </Link>
      </div>
    </main>
  );
}
