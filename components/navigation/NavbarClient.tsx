"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogIn, Sparkles, BarChart2, Search, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";
import { useModals } from "@/components/modals/ModalContext";

interface NavbarClientProps {
  initialUser: User | null;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Shows" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/collections", label: "Collections" },
  { href: "/import", label: "Import" },
];

export function NavbarClient({ initialUser }: NavbarClientProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { openAiModal, openPartyModal, openSearchModal } = useModals();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    setScrolled(window.scrollY > 60);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "glass-strong shadow-lg" : "glass"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-8">
        {/* Logo */}
        <BrandLogo size="md" priority className="mr-4" />

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive(href) ? "nav-link-active" : ""
              }`}
              style={{
                color: isActive(href) ? "var(--text-primary)" : "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!isActive(href)) {
                  (e.target as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(href)) {
                  (e.target as HTMLElement).style.color = "var(--text-muted)";
                }
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Stats shortcut */}
          {initialUser && (
            <Link
              href="/stats"
              className={buttonVariants({
                variant: isActive("/stats") ? "outline" : "ghost",
                size: "sm",
                className: "hidden sm:inline-flex",
              })}
              title="Cinema Wrapped — Your Watch Stats"
            >
              <BarChart2 size={13} />
              <span>Stats</span>
            </Link>
          )}

          {/* Watch Party */}
          <button
            onClick={openPartyModal}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}
            title="Join a Watch Party"
          >
            <Users size={13} />
            <span className="hidden md:inline">Party</span>
          </button>

          {/* AI Assistant */}
          <button
            onClick={openAiModal}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Ask Veyra AI — Find What to Watch"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Spotlight Search */}
          <button
            onClick={openSearchModal}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            title="Search (/ or Cmd+K)"
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            {initialUser ? (
              <Link
                href="/settings"
                className={buttonVariants({ variant: "secondary", size: "icon" }) + " text-sm font-medium"}
                title="Settings"
              >
                {initialUser.email?.[0]?.toUpperCase() ?? "U"}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={buttonVariants({ variant: "ghost", size: "md" })}
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={buttonVariants({ variant: "primary", size: "md" })}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <MobileMenu initialUser={initialUser} />
        </div>
      </nav>
    </header>
  );
}
