"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

export default function MovieError({
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
          Couldn&apos;t load this title
        </h2>
        <p className="text-sm text-muted">
          The movie may not exist or the media service is temporarily unavailable.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          Retry
        </button>
        <Link
          href="/movies"
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          Browse Movies
        </Link>
      </div>
    </main>
  );
}
