import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold text-white"
          >
            <span className="text-accent">V</span>EYRA
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/movies" className="transition hover:text-white">
              Movies
            </Link>
            <Link href="/tv" className="transition hover:text-white">
              TV Shows
            </Link>
            <Link href="/search" className="transition hover:text-white">
              Search
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Use
            </Link>
          </nav>
        </div>

        <div className="mt-8 text-center text-xs text-muted/60 space-y-1">
          <p>
            This product uses the{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent/80 hover:text-accent"
            >
              TMDB API
            </a>{" "}
            but is not endorsed or certified by TMDB.
          </p>
          <p>
            Veyra does not host, store, or distribute any video content. Video
            playback is provided by third-party services. Use responsibly.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} Veyra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
