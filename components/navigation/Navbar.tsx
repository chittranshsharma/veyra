import Link from "next/link";
import { Film, Tv, Home, BookmarkCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MobileMenu, NavSearchButton } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Shows", icon: Tv },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkCheck },
];

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="glass sticky top-0 z-40 w-full border-b border-white/5">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="mr-4 shrink-0 font-display text-2xl font-bold tracking-tight text-white"
        >
          <span className="text-accent">V</span>EYRA
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <NavSearchButton />

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent ring-2 ring-accent/30 transition hover:ring-accent"
              >
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <MobileMenu initialUser={user} />
        </div>
      </nav>
    </header>
  );
}
