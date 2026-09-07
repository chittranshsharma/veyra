# Veyra — Comprehensive Project Progress & Handover Document

> **Project Repository**: [github.com/chittranshsharma/veyra](https://github.com/chittranshsharma/veyra)  
> **Status**: Phase 1 Fully Complete | Production Build Passing (`17/17` routes optimized) | Zero TypeScript Errors  
> **Tech Stack**: Next.js 16 (App Router + Turbopack), TypeScript 5.6 (Strict Mode), Tailwind CSS 3.4, Supabase (SSR Auth + Postgres + RLS), TMDB API (v4), Motion, Vidking Player Integration.

---

## 📌 Executive Summary

**Veyra** is a movie and TV series discovery and streaming platform built on Next.js 16. It offers instant playback of movies and TV episodes via embedded player integration, automated cross-device watch progress tracking (~10s debounced sync to Supabase), personal watchlists with Row Level Security (RLS), real-time debounced multi-search, complete authentication flows, and a dark glassmorphism design system.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Key Details |
|---|---|---|
| **Framework** | Next.js 16.0.0 (Turbopack) | App Router, Server Components by default, Route Handlers, Middleware |
| **Language** | TypeScript 5.6 | Strict mode enabled, zero `any` leaks, Supabase generated DB types |
| **Styling** | Tailwind CSS 3.4 | Custom theme tokens (`surface`, `surface2`, `accent`), Glassmorphism utilities |
| **Fonts** | Google Fonts | `Space Grotesk` (Display Headings) + `Manrope` (Body typography) |
| **Database** | Supabase (PostgreSQL) | RLS enabled on all user tables, automated signup triggers |
| **Auth** | Supabase Auth (`@supabase/ssr`) | SSR cookie session management, middleware route guards, OAuth ready |
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
│   ├── api/
│   │   ├── progress/route.ts          # Zod-validated watch progress upsert endpoint
│   │   ├── tmdb/season/route.ts       # Server-side TV season episode fetcher
│   │   └── watchlist/route.ts         # Add/Remove watchlist items with RLS
│   ├── auth/
│   │   ├── callback/route.ts          # OAuth code exchange callback handler
│   │   ├── login/page.tsx             # Login form with Zod & Supabase auth
│   │   ├── signout/route.ts           # POST signout route
│   │   └── signup/page.tsx            # Signup form with username & auto profile trigger
│   ├── movie/[id]/
│   │   ├── error.tsx                  # Error boundary for movie details
│   │   ├── loading.tsx                # Skeleton fallback
│   │   └── page.tsx                   # Full-bleed movie detail page + trailer modal
│   ├── movies/
│   │   └── page.tsx                   # Movies discovery catalog
│   ├── search/
│   │   ├── loading.tsx                # Search skeleton
│   │   └── page.tsx                   # Multi-category search results grid
│   ├── settings/
│   │   └── page.tsx                   # Protected user profile & account actions
│   ├── tv/
│   │   ├── [id]/                      # TV series details page with season accordion
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
│   └── page.tsx                       # Homepage with dynamic hero & content rails
├── components/
│   ├── movie/
│   │   ├── PosterCard.tsx             # Motion-animated media poster with progress overlay
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
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client (`createBrowserClient`)
│   │   └── server.ts                  # Server Supabase client (`createServerClient`)
│   ├── tmdb/
│   │   ├── client.ts                  # Server-only TMDB API wrapper (`server-only`)
│   │   └── image.ts                   # Image URL formatting utilities
│   └── validation/
│       └── progress.ts                # Zod schemas for progress payloads
├── middleware.ts                      # Session refresh & route guard (/watchlist, /settings)
├── next.config.ts                     # Security CSP headers & remote image patterns
├── supabase/
│   └── migrations/0001_init.sql       # Database schema setup & RLS policies
├── types/
│   └── database.ts                    # Supabase TypeScript database definitions
└── package.json                       # Dependencies & build scripts
```

---

## 🗄️ Database Schema & SQL Setup

The database is built on Supabase (PostgreSQL). The complete migration file is located in [`supabase/migrations/0001_init.sql`](file:///c:/Users/chitt/Desktop/veyra/supabase/migrations/0001_init.sql):

### 1. `profiles`
- Stores user profile information.
- Auto-created via PostgreSQL trigger when a user signs up through Supabase Auth.
- Columns: `id` (uuid, PK, references auth.users), `username` (text), `avatar_url` (text), `created_at` (timestamp).
- RLS: Public read, self update.

### 2. `watchlist`
- Stores user-saved movies and TV shows.
- Columns: `id` (uuid, PK), `user_id` (uuid, FK), `tmdb_id` (bigint), `media_type` (text: 'movie' | 'tv'), `title` (text), `poster_path` (text), `added_at` (timestamp).
- RLS: Select/Insert/Delete restricted to authenticated row owner (`auth.uid() = user_id`).

### 3. `watch_progress`
- Stores playback position for resume functionality.
- Columns: `id` (uuid, PK), `user_id` (uuid, FK), `tmdb_id` (bigint), `media_type` (text), `season` (int), `episode` (int), `progress_seconds` (int), `duration_seconds` (int), `progress_percent` (float), `completed` (boolean), `last_watched_at` (timestamp).
- RLS: Select/Insert/Update restricted to authenticated row owner.

### 4. `reviews`
- User ratings and reviews.
- Columns: `id` (uuid, PK), `user_id` (uuid, FK), `tmdb_id` (bigint), `media_type` (text), `rating` (int), `comment` (text), `created_at` (timestamp).
- RLS: Public read, self insert/update/delete.

---

## ⚡ Key Implementation Highlights

1. **Vidking Player & Progress Tracking**:
   - `VideoPlayer.tsx` embeds the Vidking player inside an `<iframe>`.
   - Listens to `message` events from `https://vidking.net`.
   - Validates event payload shape using Zod (`ProgressPayloadSchema`).
   - Debounces updates and sends `POST` requests to `/api/progress`.
   - The homepage automatically loads the user's top 10 `watch_progress` items into a **"Continue Watching"** rail with progress bar indicators on posters.

2. **Supabase Type-Safety Resolution**:
   - Extracted live typescript definitions using Supabase MCP tool (`generate_typescript_types`).
   - Solved parameter count mismatches between `@supabase/ssr` (`createServerClient`, `createBrowserClient`) and `@supabase/supabase-js` by explicitly typing client instances as `SupabaseClient<Database>`.

3. **Performance & Security Rules**:
   - Server Components by default; `"use client"` is restricted strictly to interactive islands (`WatchlistButton`, `SearchInput`, `TrailerModal`, `VideoPlayer`, `MobileMenu`, `SeasonAccordion`).
   - TMDB Read Access Token is guarded behind `import "server-only"`.
   - Next.js `next.config.ts` includes Content Security Policy headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
   - Route protection middleware redirects unauthenticated requests attempting to access `/watchlist` or `/settings` to `/auth/login?redirectTo=...`.

---

## 🧪 Verification & Build Status

- **TypeScript Checking**: `npx tsc --noEmit` returns **0 errors**.
- **Next.js Production Build**: `npm run build` succeeds with **Exit Code 0**.
  - All 17 static and server-rendered routes build cleanly.
- **Local Dev Server**: Active on `http://localhost:3000` (HTTP 200).
- **Git Repository**: All work committed and pushed to `main` at `https://github.com/chittranshsharma/veyra.git`.

---

## 🎯 Next Steps / Roadmap for Future Phases

If continuing development in future passes:
1. **Cloudflare Turnstile**: Integrate bot protection on `/auth/login` and `/auth/signup` forms (placeholders already added in `.env.local`).
2. **Resend Email Service**: Connect transactional emails for email verification and password resets.
3. **Upstash Redis Rate-Limiting**: Add rate-limiting middleware to `/api/progress` and `/api/watchlist` to prevent API abuse.
4. **Interactive Reviews UI**: Add user rating and review submission forms on movie and TV detail pages using the existing `reviews` database table.
5. **Admin Dashboard**: Build an administrative interface for managing featured titles and monitoring user activity.
