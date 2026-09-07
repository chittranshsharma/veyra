import Link from "next/link";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="relative">
        <Film size={72} className="text-muted/20" />
        <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-muted/60">
          404
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold text-white">Page not found</h1>
        <p className="text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-background transition hover:brightness-110"
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className="rounded-xl bg-surface px-6 py-3 font-semibold text-white transition hover:bg-surface2"
        >
          Search
        </Link>
      </div>
    </main>
  );
}
