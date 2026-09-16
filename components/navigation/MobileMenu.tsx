"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Menu, Search, Film, Tv, Home, BookmarkCheck, Library, Download, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Shows", icon: Tv },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkCheck },
  { href: "/collections", label: "Collections", icon: Library },
  { href: "/import", label: "Import", icon: Download },
  { href: "/stats", label: "Cinema Stats", icon: BarChart2 },
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
        className="flex items-center justify-center rounded-lg p-2 transition md:hidden"
        style={{ color: "var(--text-muted)" }}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-72 px-6 py-8 shadow-2xl"
            style={{
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div onClick={() => setOpen(false)}>
                <BrandLogo size="md" href="/" />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-lg p-2 transition"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Theme toggle in mobile drawer */}
            <div className="mb-6">
              <ThemeToggle />
            </div>

            <nav className="space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
                  style={{
                    color: pathname === href ? "var(--accent)" : "var(--text-muted)",
                    background: pathname === href ? "var(--accent-dim)" : "transparent",
                  }}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>

            <div
              className="mt-8 border-t pt-8"
              style={{ borderColor: "var(--border)" }}
            >
              {user ? (
                <div className="space-y-3">
                  <p className="truncate text-sm" style={{ color: "var(--text-muted)" }}>
                    {user.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium transition"
                    style={{
                      background: "var(--bg-surface2)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    className={buttonVariants({ variant: "secondary", size: "lg", className: "w-full" })}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
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
      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition"
      style={{
        background: "var(--bg-surface2)",
        borderColor: "var(--border)",
        color: "var(--text-muted)",
      }}
      aria-label="Search"
    >
      <Search size={16} />
      <span className="hidden sm:inline">Search...</span>
    </button>
  );
}
