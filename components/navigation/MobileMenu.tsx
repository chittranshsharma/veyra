"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(initialUser);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [open]);

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
        className="flex h-9 w-9 items-center justify-center rounded-xl p-2 transition hover:bg-[var(--bg-surface2)] active:scale-95 md:hidden"
        style={{
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          background: "var(--bg-surface2)",
        }}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu size={20} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id="veyra-mobile-menu"
            className="fixed inset-0 z-[100] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div
              className="absolute right-0 top-0 bottom-0 h-full w-[310px] max-w-[85vw] flex flex-col justify-between shadow-2xl overflow-y-auto"
              style={{
                background: "var(--bg-surface)",
                borderLeft: "1px solid var(--border)",
              }}
            >
              <div className="px-6 pt-6 pb-4">
                {/* Header with Logo and Close button */}
                <div className="mb-6 flex items-center justify-between">
                  <div onClick={() => setOpen(false)}>
                    <BrandLogo size="md" href="/" />
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-[var(--bg-surface2)] active:scale-95"
                    style={{
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface2)",
                    }}
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Appearance
                  </p>
                  <ThemeToggle showLabels className="w-full justify-center" />
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Menu
                  </p>
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition active:scale-[0.98]"
                        style={{
                          color: active ? "var(--accent)" : "var(--text-secondary)",
                          background: active ? "var(--accent-dim)" : "transparent",
                        }}
                      >
                        <Icon size={18} className={active ? "text-accent" : "text-text-muted"} />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User / Auth footer */}
              <div
                className="px-6 py-6 border-t mt-auto"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-surface2)",
                  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
                }}
              >
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">
                        {user.email?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <p className="truncate text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-medium transition hover:brightness-110 active:scale-95"
                      style={{
                        background: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ variant: "secondary", size: "md", className: "w-full justify-center" })}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ variant: "primary", size: "md", className: "w-full justify-center" })}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
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
