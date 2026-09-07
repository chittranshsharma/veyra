# Movie Site — starter scaffold

Real working scaffold: Next.js 16 App Router, TypeScript strict, Tailwind, Supabase
(auth + Postgres + RLS), TMDB metadata, Vidking player with progress tracking.

## What's already wired up

- `lib/tmdb/client.ts` — typed, cached, server-only TMDB client
- `lib/supabase/{client,server}.ts` — browser + server Supabase clients (SSR-safe)
- `supabase/migrations/0001_init.sql` — `profiles`, `watchlist`, `watch_progress`,
  `reviews` tables, all with RLS policies + a trigger that auto-creates a profile
  on signup
- `components/player/VideoPlayer.tsx` — Vidking iframe, validates `postMessage`
  origin + shape with Zod, debounces `timeupdate`, POSTs to `/api/progress`
- `app/api/progress/route.ts` — auth-checked, Zod-validated upsert into
  `watch_progress`
- `app/page.tsx` — home page pulling live trending/popular data into a hero +
  horizontal rails
- `app/watch/movie/[id]/page.tsx` — full loop: fetch movie, check saved
  progress, resume playback

## Not built yet (next in the phase plan)

- `/tv/[id]` and `/watch/tv/[id]/[season]/[episode]` pages (movie version is the
  template — copy the pattern, add season/episode params)
- `/search` page (use `tmdb.searchMulti`)
- Sign up / log in pages using `lib/supabase/client.ts`
- Watchlist add/remove UI (table + RLS already exist)
- "Continue Watching" row on a `/library` page (query `watch_progress` ordered by
  `last_watched_at`)

## Setup

```bash
npm install
cp .env.example .env.local   # fill in TMDB + Supabase keys
```

1. **TMDB**: create an account at themoviedb.org → Settings → API → grab the
   "API Read Access Token" (v4 auth) → put it in `TMDB_READ_ACCESS_TOKEN`.
2. **Supabase**: create a project → Project Settings → API → copy `URL` and
   `anon public` key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   Copy the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (server-only,
   never expose to browser).
3. Run the migration: paste `supabase/migrations/0001_init.sql` into the
   Supabase SQL editor, or apply it through the Supabase MCP tool in
   Antigravity.
4. `npm run dev` → http://localhost:3000

## Rules to keep enforcing as you build more pages

- Server Components by default. `"use client"` only where there's real
  interactivity (forms, the player, anything using hooks/browser APIs).
- Never call TMDB from a Client Component — always go through a Server
  Component or route handler so the token stays server-side.
- Every table with user data needs RLS — copy the pattern in the migration
  file for any new table.
- Validate all external input (form bodies, postMessage events) with Zod
  before it touches the database — see `lib/validation/progress.ts`.
