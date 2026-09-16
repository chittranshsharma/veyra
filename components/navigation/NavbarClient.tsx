"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogIn, Sparkles } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MobileMenu, NavSearchButton } from "./MobileMenu";
import { AiConciergeModal } from "@/components/ai/AiConciergeModal";

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
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Set initial state
    setScrolled(window.scrollY > 60);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled
          ? "glass-strong border-accent/10"
          : "glass border-white/5"
      }`}
    >
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
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive(href)
                  ? "nav-link-active text-white"
                  : "text-muted hover:bg-surface hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 px-3 py-1.5 text-xs font-bold text-accent border border-accent/40 shadow-sm hover:border-accent hover:from-accent/30 hover:to-purple-500/30 transition-all active:scale-95"
            title="Ask Veyra AI Concierge"
          >
            <Sparkles size={13} className="text-accent animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          <NavSearchButton />

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            {initialUser ? (
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent ring-2 ring-accent/30 transition hover:ring-accent hover:bg-accent/30"
                title="Settings"
              >
                {initialUser.email?.[0]?.toUpperCase() ?? "U"}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:text-white"
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-shimmer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
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

      {/* Global AI Concierge Modal */}
      <AiConciergeModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </header>
  );
}
