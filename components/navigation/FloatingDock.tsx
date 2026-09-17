"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Film,
  Tv,
  Search,
  Sparkles,
  BookmarkCheck,
  Users,
} from "lucide-react";
import { useModals } from "@/components/modals/ModalContext";

interface DockItem {
  id: string;
  label: string;
  href?: string;
  icon: typeof Home;
  isAiAction?: boolean;
  isSearchAction?: boolean;
  isPartyAction?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "movies", label: "Movies", href: "/movies", icon: Film },
  { id: "tv", label: "TV Shows", href: "/tv", icon: Tv },
  { id: "search", label: "Search", icon: Search, isSearchAction: true },
  { id: "ai", label: "Ask AI", icon: Sparkles, isAiAction: true },
  { id: "party", label: "Party", icon: Users, isPartyAction: true },
  { id: "watchlist", label: "Watchlist", href: "/watchlist", icon: BookmarkCheck },
];

export function FloatingDock() {
  const pathname = usePathname();
  const { openAiModal, openPartyModal, openSearchModal } = useModals();

  // Hide the dock when viewing the video player to avoid blocking playback controls
  if (pathname.startsWith("/watch")) {
    return null;
  }

  const isCurrentActive = (href?: string) => {
    if (!href) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <>
      {/* Floating Glassmorphic macOS-Style Dock (Mobile & Tablet) */}
      <nav
        aria-label="Floating Navigation Dock"
        className="fixed bottom-3 inset-x-0 z-40 flex justify-center pointer-events-none md:hidden px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2px)" }}
      >
        <div
          style={{
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--border)",
            boxShadow:
              "0 14px 40px -6px rgba(0, 0, 0, 0.65), 0 0 0 1px var(--border), 0 2px 12px var(--accent-dim)",
          }}
          className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full border backdrop-blur-2xl transition-all duration-300"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.href);

            if (item.isAiAction) {
              return (
                <button
                  key={item.id}
                  onClick={openAiModal}
                  aria-label="Ask Veyra AI"
                  className="group relative flex h-11 w-11 flex-col items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:text-text-primary hover:bg-surface2/80 active:scale-90"
                >
                  <div className="relative">
                    <Icon size={19} className="text-accent transition-transform duration-200 group-hover:scale-110" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                    </span>
                  </div>
                  <span className="sr-only">{item.label}</span>
                </button>
              );
            }

            if (item.isSearchAction) {
              return (
                <button
                  key={item.id}
                  onClick={openSearchModal}
                  aria-label="Search"
                  className="group relative flex h-11 w-11 flex-col items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:text-text-primary hover:bg-surface2/80 active:scale-90"
                >
                  <Icon size={19} className="transition-transform duration-200 group-hover:scale-110" />
                  <span className="sr-only">{item.label}</span>
                </button>
              );
            }

            if (item.isPartyAction) {
              return (
                <button
                  key={item.id}
                  onClick={openPartyModal}
                  aria-label="Join Watch Party"
                  className="group relative flex h-11 w-11 flex-col items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:text-text-primary hover:bg-surface2/80 active:scale-90"
                >
                  <Icon size={19} className="transition-transform duration-200 group-hover:scale-110" />
                  <span className="sr-only">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                aria-label={item.label}
                className={`group relative flex h-11 w-11 flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
                  active
                    ? "bg-accent text-[var(--on-accent)] font-bold shadow-md shadow-accent/30 scale-105"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface2/80"
                }`}
              >
                <Icon
                  size={19}
                  className={`transition-transform duration-200 ${
                    active ? "scale-105" : "group-hover:scale-110"
                  }`}
                />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
