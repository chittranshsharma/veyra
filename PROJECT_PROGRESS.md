# Veyra — Comprehensive Project Progress & Handover Document

> **Project Repository**: [github.com/chittranshsharma/veyra](https://github.com/chittranshsharma/veyra)  
> **Status**: Phase 1 & Phase 2 Fully Complete | Production Build Passing (`21/21` routes optimized) | Zero TypeScript Errors  
> **Tech Stack**: Next.js 16 (App Router + Turbopack), TypeScript 5.6 (Strict Mode), Tailwind CSS 3.4, Supabase (SSR Auth + Postgres + RLS), TMDB API (v4), Motion, Vidking Player Integration, Cloudflare Turnstile, Resend, Upstash Redis Rate Limiting.

---

## 📌 Executive Summary

**Veyra** is a movie and TV series discovery and streaming platform built on Next.js 16. It offers instant playback of movies and TV episodes via embedded player integration, automated cross-device watch progress tracking (~10s debounced sync to Supabase), personal watchlists with Row Level Security (RLS), real-time debounced multi-search, complete authentication flows with Cloudflare Turnstile bot protection, password reset flow, interactive review scoring & moderation, Upstash Redis sliding window rate limiting, and an admin dashboard.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Key Details |
|---|---|---|
| **Framework** | Next.js 16.0.0 (Turbopack) | App Router, Server Components by default, Route Handlers, Middleware |
| **Language** | TypeScript 5.6 | Strict mode enabled, zero `any` leaks, Supabase generated DB types |
| **Styling** | Tailwind CSS 3.4 | Custom theme tokens (`surface`, `surface2`, `accent`), Glassmorphism utilities |
| **Fonts** | Google Fonts | `Space Grotesk` (Display Headings) + `Manrope` (Body typography) |
| **Database** | Supabase (PostgreSQL) | RLS enabled on all user tables, automated signup triggers, admin moderation |
| **Auth** | Supabase Auth (`@supabase/ssr`) | SSR cookie session management, middleware route guards, OAuth ready |
| **Bot Protection** | Cloudflare Turnstile | Client widget + server-side verification against Cloudflare `siteverify` |
| **Email Delivery** | Resend | Server-only transactional client (`lib/email/resend.ts`) for custom branded emails |
| **Rate Limiting** | Upstash Redis | Sliding window limiter (`@upstash/ratelimit`) on API routes and auth actions |
| **Video Engine** | Vidking Embed Player | Window `postMessage` listener for `timeupdate` and `ended` events |
| **Metadata API** | TMDB API | Server-only cached client (`server-only` guard), no client API token exposure |
| **Validation** | Zod 3.23 | Schema validation for route handler payloads & postMessage events |
| **Animations** | Motion 11.11 (`framer-motion`) | Entrance staggers, modal overlays, drawer transitions |

---

## 📂 Project File Structure & Completed Components

```text
veyra/
├── app/
│   ├── (marketing)/
│   │   ├── privacy/page.tsx           # Privacy Policy page with TMDB attribution
│   │   └── terms/page.tsx             # Terms of Service & disclaimer
│   ├── admin/
│   │   ├── actions.ts                 # Server actions for featured titles & review moderation
│   │   └── page.tsx                   # Protected Admin Dashboard (signups, moderation, featured)
│   ├── api/
│   │   ├── progress/route.ts          # Zod-validated watch progress with rate limiting
│   │   ├── reviews/route.ts           # Zod-validated review create/update/delete endpoint
│   │   ├── tmdb/season/route.ts       # Server-side TV season episode fetcher
│   │   └── watchlist/route.ts         # Add/Remove watchlist items with rate limiting
│   ├── auth/
│   │   ├── actions.ts                 # Server Actions with Turnstile & rate limiting (login, signup, password reset)
│   │   ├── callback/route.ts          # OAuth code exchange callback handler
│   │   ├── forgot-password/page.tsx   # Password reset request page with Turnstile
│   │   ├── login/page.tsx             # Login form with Turnstile & Server Action
│   │   ├── reset-password/page.tsx    # Password reset confirmation & update page
│   │   ├── signout/route.ts           # POST signout route
│   │   └── signup/page.tsx            # Signup form with Turnstile & welcome email trigger
│   ├── movie/[id]/
│   │   ├── error.tsx                  # Error boundary for movie details
│   │   ├── loading.tsx                # Skeleton fallback
│   │   └── page.tsx                   # Full-bleed movie detail page + trailer + reviews
│   ├── movies/
│   │   └── page.tsx                   # Movies discovery catalog
│   ├── search/
│   │   ├── loading.tsx                # Search skeleton
│   │   └── page.tsx                   # Multi-category search results grid
│   ├── settings/
│   │   └── page.tsx                   # Protected user profile & account actions
│   ├── tv/
│   │   ├── [id]/                      # TV series details page with season accordion + reviews
│   │   └── page.tsx                   # TV shows discovery catalog
│   ├── watch/
│   │   ├── movie/[id]/page.tsx        # Movie video player page with live progress sync
│   │   └── tv/[id]/[season]/[episode]/# TV episode player with next/prev navigation
│   ├── watchlist/
│   │   └── page.tsx                   # Protected user saved library
│   ├── error.tsx                      # Global app error boundary
│   ├── globals.css                    # Google fonts, CSS custom properties, utility classes
│   ├── layout.tsx                     # Root layout with Navbar & Footer
│   ├── loading.tsx                    # Global loading skeleton
│   ├── not-found.tsx                  # Custom 404 page
│   └── page.tsx                       # Homepage with hero, continue watching & optional featured
├── components/
│   ├── admin/
│   │   └── AdminControls.tsx          # Featured titles form & moderation delete buttons
│   ├── auth/
│   │   └── TurnstileWidget.tsx        # Cloudflare Turnstile dark-mode widget
│   ├── movie/
│   │   ├── PosterCard.tsx             # Motion-animated media poster with progress overlay
│   │   ├── ReviewSection.tsx          # Interactive reviews, 1-10 rating picker, and author deletion
│   │   ├── Row.tsx                    # Horizontal scrolling carousel with desktop arrows
│   │   ├── SeasonAccordion.tsx        # Expandable TV season episode selector
│   │   ├── TrailerModal.tsx           # YouTube trailer popup dialog
│   │   └── WatchlistButton.tsx        # Client island for toggling saved watchlist items
│   ├── navigation/
│   │   ├── MobileMenu.tsx             # Mobile drawer navigation menu
│   │   └── Navbar.tsx                 # Top navigation bar with live auth status & search
│   ├── player/
│   │   └── VideoPlayer.tsx            # Vidking player iframe with postMessage listener
│   ├── search/
│   │   └── SearchInput.tsx            # Debounced search bar component
│   └── ui/
│       ├── Badge.tsx                  # Genre pills & rating badges
│       ├── Button.tsx                 # System button variants (CVA)
│       ├── Footer.tsx                 # Site footer with TMDB disclaimer
│       └── Skeleton.tsx               # Animated skeleton pulse loaders
├── lib/
│   ├── email/
│   │   └── resend.ts                  # Server-only Resend transactional email client
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client (`createBrowserClient`)
│   │   └── server.ts                  # Server Supabase client (`createServerClient`, `createServiceClient`)
│   ├── tmdb/
│   │   ├── client.ts                  # Server-only TMDB API wrapper (`server-only`)
│   │   └── image.ts                   # Image URL formatting utilities
│   ├── rate-limit.ts                  # Upstash Redis sliding window limiter + local fallback
│   ├── turnstile.ts                   # Server-only Cloudflare Turnstile token verifier
│   └── validation/
│       └── progress.ts                # Zod schemas for progress payloads
├── middleware.ts                      # Session refresh, route guards & admin protection
├── next.config.ts                     # Security CSP headers & remote image patterns
├── supabase/
│   ├── migrations/0001_init.sql       # Initial database schema setup & RLS policies
│   └── migrations/0002_admin.sql      # is_admin column, admin policies & featured_titles
├── types/
│   └── database.ts                    # Supabase TypeScript database definitions
└── package.json                       # Dependencies & build scripts
```

---

## 🗄️ Database Schema & SQL Setup

The database is built on Supabase (PostgreSQL):
- **`profiles`**: User metadata, usernames, avatars, and `is_admin` boolean.
- **`featured_titles`**: Curated titles with custom ordering for homepage rails.
- **`reviews`**: Community reviews with ratings (1–10) and comments, unique per `(user_id, tmdb_id, media_type)`.
- **`watchlist`**: Saved titles with RLS.
- **`watch_progress`**: Playback positions with RLS and upsert triggers.

---

## 🧪 Verification & Build Status

- **TypeScript Checking**: `npx tsc --noEmit` returns **0 errors**.
- **Next.js Production Build**: `npm run build` succeeds with **Exit Code 0**.
  - All 21 static and server-rendered routes build cleanly.
- **Local Dev Server**: Active on `http://localhost:3000` (HTTP 200).
- **Git Repository**: All work committed and pushed to `main` at `https://github.com/chittranshsharma/veyra.git`.
