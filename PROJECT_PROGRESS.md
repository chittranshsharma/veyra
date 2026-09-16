<p align="center">
  <img src="./public/logo.png" alt="Veyra — Cinema Lives Here" width="220" />
</p>

# Veyra — Comprehensive Project Progress & Architecture Report

> **Project Repository**: [github.com/chittranshsharma/veyra](https://github.com/chittranshsharma/veyra)  
> **Status**: Full Bespoke Dual-Palette Redesign + 6-Server Streaming Player + Built-in Ad Shield + Automated Internet Subtitles + 5-Layer Cinema Background + Cinema Wrapped Analytics + Smart AI Cinema Intelligence Suite  
> **Code Health**: 0 TypeScript Errors (`npx tsc --noEmit` passing cleanly) | 33 Routes Operational  
> **Core Stack**: Next.js 16 (Turbopack), TypeScript 5.6 (Strict Mode), Tailwind CSS 3.4, Supabase (SSR Auth + Postgres + RLS), Smart AI Engine, HTML5 Canvas, Motion, OpenSubtitles API Engine.

---

## 📌 1. Executive Summary

**Veyra** is an editorial-grade cinema streaming and media intelligence platform designed from the ground up to evoke the tactile luxury of boutique 35mm repertory cinema.

Rather than relying on generic modern web templates, Veyra introduces a proprietary visual identity featuring **Obsidian Dark Mode** (35mm amber on matte obsidian) and **Sakura Blossom Mode** (crisp espresso typography on delicate pastel blush). The platform pairs this aesthetic with instant high-definition streaming across a **6-server failover network**, an **active iframe Ad & Popup Shield**, an **automated internet subtitle scraping system** covering 30+ languages, cross-device **debounced watch progress sync**, a personal **Cinema Wrapped / Watch Stats engine** with 1-click high-resolution PNG exports, a **Letterboxd data importer**, and an intelligent cinema companion powered by a **Smart AI Engine**.

---

## 🏛️ 2. Core Architecture & Feature Matrix

| Feature Domain | Module / Route | Status | Description |
|---|---|---|---|
| **Branding & Visuals** | `BrandLogo.tsx`, `public/logo.png` | Complete | Custom 3D studio emblem, responsive navbar/drawer/footer integration. |
| **Atmospheric Background** | `CinemaBackground.tsx` | Complete | 5-layer depth: Spotlight, Nebula glow, custom seamless tile, 35mm grain, vignette. |
| **Streaming Player** | `VideoPlayer.tsx` | Complete | 6 high-speed servers with instant switcher, iframe Ad Shield, progress sync. |
| **Automated Subtitles** | `/api/subtitles`, `SubtitleOverlay.tsx` | Complete | Auto-scrapes OpenSubtitles archive, CORS proxy, in-player language drawer & sync. |
| **Dual-Palette System** | `globals.css`, `ThemeToggle.tsx` | Complete | Obsidian Dark & Sakura Light modes with strict WCAG contrast & cinema-dark protection. |
| **Cinema Wrapped** | `/stats`, `StatsShareCard.tsx` | Complete | Live streaming metrics, top genres, decades, and 1240×680 HTML5 canvas export. |
| **AI Cinema Companion** | `/api/ai/*`, `AiConciergeModal.tsx` | Complete | AI Movie Finder, Trivia & Insights, and Episode Recaps. |
| **Letterboxd Importer** | `/import`, `/api/import/letterboxd` | Complete | Dual ingestion via Letterboxd `watched.csv` or public RSS username feeds. |
| **Curated Collections** | `/collections`, `/api/collections` | Complete | Custom themed cinema lists with rankings, public/private toggles, and covers. |
| **TV Series Suite** | `/tv/[id]`, `/watch?mediaType=tv` | Complete | Interactive season selector, episode grid, next/previous episode auto-advance. |
| **Security & Rate Limiting** | `rate-limit.ts`, Turnstile | Complete | Upstash Redis sliding window limiter and Cloudflare Turnstile bot verification. |

---

## 🎬 3. Deep Dive: Recent Major Upgrades

### 3.1. Next-Gen 6-Server Streaming Engine
The video playback architecture was rebuilt from a fragile 3-server setup to an enterprise-grade 6-server failover network with persistent state:
1. **VidLink** *(Default)*: Ultra HD stream with built-in subtitles, resume playback, and minimal ad interference.
2. **VidKing**: Fast streaming node with automated next-episode triggers and cloud progress sync.
3. **2Embed**: Direct 1080p fallback node with high global availability.
4. **EmbedSU**: Global Edge CDN server optimized for low-latency streaming.
5. **SuperEmbed**: Multi-host aggregator automatically routing to the fastest available mirror.
6. **Smashy**: High-reliability backup mirror ensuring zero dead streams.

### 3.2. 🛡️ Built-in Ad & Popup Shield
A recurring issue with third-party video embeds is aggressive popup tabs (`window.open`) and redirect spam. Veyra resolves this through an architectural sandbox barrier:
- **Iframe Sandboxing**: Configured with `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"`.
- **Enforcement**: By omitting `allow-popups` and `allow-top-navigation`, all popup spam, redirect scripts, and malicious clickjacks are blocked at the browser level before execution.
- **HUD Control**: Added an interactive **"🛡️ Ad Shield: Active"** status badge in the player toolbar allowing users to inspect protection status.

### 3.3. 🌐 Automated Internet Subtitles Engine
Users no longer need to search for, download, or manually upload `.vtt` or `.srt` subtitle files:
- **Scraper Route (`/api/subtitles`)**: Automatically queries open subtitle archives using IMDb IDs resolved from media metadata. Supports both feature films and specific TV episodes (`season` + `episode`).
- **Live Coverage**: Yields dozens of verified subtitle tracks (e.g. 36 tracks for movies, 80+ tracks for popular TV episodes) across English, Spanish, French, German, Italian, Portuguese, Arabic, Hindi, Japanese, and more.
- **CORS Streaming Proxy (`/api/subtitles/content`)**: Fetches subtitle streams server-side and serves them with permissive CORS headers, bypassing browser cross-origin blocks.
- **In-Player Subtitle Drawer (`SubtitleOverlay.tsx`)**:
  - Automatically activates English subtitles on mount if available.
  - 1-tap language switcher drawer with search filter.
  - Audio synchronization offset adjustment (`-0.5s` to `+0.5s` in fine 500ms increments).
  - Customizable font size, text color, and background backing opacity.

### 3.4. 🌌 5-Layer Atmospheric Cinema Background System
To replace flat solid backgrounds with cinematic depth, `components/ui/CinemaBackground.tsx` implements a 5-layer composite:
1. **Top Projection Spotlight**: Warm radial amber beam (`rgba(239, 123, 68, 0.08)`) simulating an authentic theater projection booth beam.
2. **Atmospheric Nebula Light Pods**: Deep ambient indigo and rose pools (`cinema-nebula-left`) that softly shift hue based on the active theme.
3. **Custom Seamless Cinema Pattern**: Hand-drawn vector tiles featuring 35mm film strips, clapperboards, film reels, tickets, and Veyra monograms at 8.5% opacity.
4. **Tactile 35mm Film Grain Texture**: Organic monochrome film grain overlay eliminating digital color banding.
5. **Cinematic Edge Vignette**: Radial gradient darkening perimeter edges to guide visual focus toward movie cards.

### 3.5. 🌸 Sakura Blossom Mode Contrast & Visibility Engine
Addressed visibility issues where light mode elements were washed out:
- **Espresso High-Contrast Typography**: Replaced faint grey tones with deep `#231217` espresso text on light surfaces, achieving a 16:1 contrast ratio exceeding WCAG AAA standards.
- **Universal Cinema-Dark Boundary**: Implemented `[data-cinema-dark]` attribute protection across video player controls, HUD overlays, and poster card hover states. Controls maintain crisp white text over solid dark glass (`bg-black/75` with `border-white/20`) regardless of active theme.
- **Theme-Aware Badges**: Remapped UI badges to semantic CSS tokens (`var(--bg-surface2)` and `var(--text-primary)`).

### 3.6. 🛠️ Turbopack RSC Stability Fix
Extracted movie studio and TV network definitions (`MOVIE_STUDIOS`, `TV_NETWORKS`, `NetworkItem`) from client-only components into a shared data module (`lib/constants/networks.ts`). This eliminated runtime `TypeError: MOVIE_STUDIOS.find is not a function` during Turbopack server component evaluation.

---

## 📊 4. Personal Watch Stats & "Cinema Wrapped" (`/stats`)

- **Live Watch Metrics**: Real-time aggregation of total streamed hours, completed films, TV episodes, and average user score.
- **Visual Taste Analytics**: Dynamic horizontal distribution bars representing top genres, release eras (2020s down to Classics), and movies-to-TV viewing ratios.
- **1240×680 Cinema Wrapped Share Card (`StatsShareCard.tsx`)**:
  - Generates an 8-poster ribbon collage representing the user's completed cinema journey.
  - Watermarked with official Veyra branding, theme accent badges, and hero watch metrics.
  - **1-Click High-Res PNG Export**: Uses HTML5 Canvas rendering for instant download formatted for Instagram, X, or Discord.

---

## 🤖 5. Smart AI Cinema Intelligence Suite

- **AI Movie Finder (`/api/ai/recommend`)**: Friendly conversation matching whatever mood or idea you describe with the perfect films and TV shows.
- **Movie Trivia & Insights (`/api/ai/xray`)**: On-demand fun facts, behind-the-scenes trivia, and plot explanations while you watch.
- **Episode Catch-Up & Recap (`/api/ai/recap`)**: 100% spoiler-free summaries of what happened in previous episodes before you jump back in.

---

## 📁 6. Current Directory Map

```text
veyra/
├── app/
│   ├── admin/                         # Admin dashboard & moderation
│   ├── api/
│   │   ├── ai/                        # AI endpoints (recommend, trivia, recap)
│   │   ├── collections/               # Curated collections endpoints
│   │   ├── import/letterboxd/         # Letterboxd CSV/RSS importer
│   │   ├── progress/                  # Watch progress sync
│   │   ├── reviews/                   # Reviews & ratings CRUD
│   │   ├── stats/                     # Cinema Wrapped & analytics endpoint
│   │   ├── subtitles/                 # Subtitle search & CORS streaming proxy
│   │   ├── catalog/season/            # TV season fetcher
│   │   └── watchlist/                 # Watchlist toggle
│   ├── auth/                          # Login, Signup, Forgot Password with Turnstile
│   ├── collections/                   # Curated lists catalog & creation
│   ├── import/                        # Letterboxd import UI
│   ├── movie/[id]/                    # Movie detail page + trailer + reviews
│   ├── movies/                        # Movie catalog with filters
│   ├── person/[id]/                   # Actor / director filmography
│   ├── search/                        # Debounced multi-search
│   ├── settings/                      # User account & preferences
│   ├── stats/                         # Cinema Wrapped & personal analytics dashboard
│   ├── tv/[id]/                       # TV series details with season accordion
│   ├── watch/                         # Video player routes (movie & TV)
│   ├── watchlist/                     # User saved watchlist
│   ├── globals.css                    # Bespoke dual-palette CSS token system
│   ├── layout.tsx                     # Root layout with anti-FOUC theme script & CinemaBackground
│   └── page.tsx                       # Redesigned homepage with handcrafted cinema aesthetic
├── components/
│   ├── ai/                            # AI Concierge modal & Home banner
│   ├── movie/                         # PosterCard, Row, ReviewSection, TrailerModal
│   ├── navigation/                    # NavbarClient, MobileMenu with BrandLogo
│   ├── player/                        # VideoPlayer 6-server engine with Ad Shield & SubtitleOverlay
│   ├── stats/                         # StatsShareCard with HTML5 Canvas export
│   ├── theme/                         # ThemeToggle (Obsidian / Sakura switch)
│   └── ui/                            # BrandLogo, CinemaBackground, Badge, Button, Footer
├── lib/
│   ├── constants/networks.ts          # Studio and TV network definitions
│   ├── groq/client.ts                 # AI API client
│   ├── supabase/                      # SSR Supabase client & server instances
│   ├── catalog/                       # Media catalog client, image helpers, networks
│   └── rate-limit.ts                  # Upstash Redis rate limiter
├── public/
│   ├── images/                        # Background tiles (dark & sakura) and 35mm film grain
│   ├── logo.png                       # Official 3D studio logo
│   ├── logo-icon.png                  # Official 3D film-strip emblem
│   └── og-image.png                   # 1200x630 cinematic OpenGraph card
├── tailwind.config.ts                 # Tailwind bound to CSS variables
└── types/database.ts                  # Supabase database types
```

---

## 🧪 7. Verification & Build Integrity

- **TypeScript Compilation**: `npx tsc --noEmit` exits with **0 errors**.
- **Turbopack Dev Server**: Running cleanly on `http://localhost:3000`.
- **Subtitle Integration Tests**:
  - Movie Subtitles (`/api/subtitles?mediaType=movie&id=550`): Verified with 36 active tracks.
  - TV Subtitles (`/api/subtitles?mediaType=tv&id=1396&season=1&episode=1`): Verified with 89 active tracks.
- **Contrast & Theme Validation**: Both Obsidian Dark and Sakura Light modes verified across all UI surfaces with zero bleached elements or illegible text.
- **Brand Secrecy**: Zero references to external catalog providers across all user-facing pages, UI elements, and documentation.
