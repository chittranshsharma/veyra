import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer
      className="mt-20 border-t border-border bg-surface/35 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-8 sm:pb-10">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <BrandLogo size="md" showTagline />

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {[
              { href: "/movies", label: "Movies" },
              { href: "/tv", label: "TV Shows" },
              { href: "/stats", label: "Cinema Stats" },
              { href: "/search", label: "Search" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Use" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-text-muted hover:text-text-primary transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 text-center text-xs space-y-1 text-text-muted">
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
