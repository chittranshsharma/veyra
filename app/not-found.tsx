import Link from "next/link";
import { Film } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

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
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          Search
        </Link>
      </div>
    </main>
  );
}
