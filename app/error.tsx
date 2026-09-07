"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertTriangle size={56} className="text-yellow-500/60" />
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="text-muted">
          We couldn&apos;t load this page. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-background transition hover:brightness-110"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl bg-surface px-6 py-3 font-semibold text-white transition hover:bg-surface2"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
