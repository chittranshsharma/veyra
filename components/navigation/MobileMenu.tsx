"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Menu, Search, Film, Tv, Home, BookmarkCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Shows", icon: Tv },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkCheck },
];

export function MobileMenu({ initialUser }: { initialUser: User | null }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-lg p-2 text-muted transition hover:bg-surface hover:text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="glass absolute right-0 top-0 h-full w-72 px-6 py-8 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="mb-8 flex items-center justify-center rounded-lg p-2 text-muted transition hover:bg-surface hover:text-white"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>

            <nav className="space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    pathname === href
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 border-t border-white/10 pt-8">
              {user ? (
                <div className="space-y-3">
                  <p className="truncate text-sm text-muted">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl bg-surface px-4 py-3 text-sm font-medium text-white transition hover:bg-surface2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-surface2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-background transition hover:brightness-110"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function NavSearchButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/search")}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-muted transition hover:border-accent/30 hover:text-white"
      aria-label="Search"
    >
      <Search size={16} />
      <span className="hidden sm:inline">Search...</span>
    </button>
  );
}
