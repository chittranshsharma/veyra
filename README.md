<div align="center">

<img src="./public/logo.png" alt="Veyra — Cinema Lives Here" width="240" />

# Veyra

**An editorial-grade movie & TV streaming platform with bespoke dual-palette aesthetics, personal Cinema Wrapped stats, and AI-powered discovery.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![AI Powered](https://img.shields.io/badge/AI-Smart%20Discovery-orange?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-features) • [Design System](#-design-system--themes) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

- 🌸 **Bespoke Dual-Palette Design**: Handcrafted editorial cinema visual identity featuring **Obsidian Dark** (`#0A0A0A` + `#EF7B44` 35mm cinema amber) and **Sakura Mode** (`#FDF4F6` pastel blush + `#D96A8A` rose + `#231217` deep contrast espresso text).
- 🌌 **5-Layer Atmospheric Cinema Background Architecture**:
  - **Top Projection Spotlight**: Warm radial amber/rose beam replicating a 35mm theater projection glow.
  - **Atmospheric Nebula Light Pods**: Deep indigo/rose ambient glow pools adding realistic depth.
  - **Custom Seamless Cinema Tile Pattern**: Handcrafted 35mm film strips, Veyra monograms, clapperboards, film reels, tickets, and constellation sparkles at 8.5% opacity.
  - **Tactile 35mm Film Grain Texture**: Organic monochrome film noise layer eliminating flat banding for an authentic film-stock feel.
  - **Cinematic Edge Vignette**: Soft edge darkening focusing viewer attention on the movie carousels.
- ⚡ **Multi-Server Streaming Player Engine**:
  - **7 High-Speed Servers**: Instant switching between **VidKing** (Primary · Cloud Progress Sync + Auto-Next), **AutoEmbed** (Direct 1080p), **VidLink** (Ultra HD), **2Embed** (Direct Stream), **VidSrc PM** (Fast Edge), **VidSrc Pro** (Multi-Mirror), and **Smashy** (Backup Mirror).
  - **Seamless Native Playback**: Clean embed architecture with zero sandbox errors, allowing smooth playback and native player controls across all servers.
  - **Debounced Playback Progress Sync**: Seamless sync powering cross-device "Continue Watching".
- 🌐 **Automated Internet Subtitles & Audio Timing**:
  - Automatically finds subtitle tracks for any movie or TV series without requiring user file uploads.
  - Auto-discovers dozens of languages (English, Spanish, French, German, Italian, Portuguese, Arabic, Hindi, etc.).
  - Clean toolbar subtitle drawer with one-tap language switching, customizable fonts, colors, and audio sync offset controls (`+0.5s` / `-0.5s`) that never blocks on-screen player controls.
- 📊 **Personal Watch Stats & "Cinema Wrapped" (`/stats`)**:
  - Live calculation of total hours and minutes streamed across sessions.
  - Completed movies vs TV episodes counter with average review rating.
  - Visual top genres bar chart, decade breakdown, and movies vs TV shows distribution ratio.
  - **1-Click High-Res PNG Export**: Generates a 1240×680 shareable summary card with an 8-poster ribbon collage and official watermark via HTML5 Canvas.
- 🤖 **Smart AI Movie Guide**:
  - **AI Movie Finder**: Tell it what you're in the mood for, and it finds the perfect movie or TV show.
  - **Movie Trivia & Facts**: Fun behind-the-scenes facts, plot explanations, and insights while you watch.
  - **Episode Catch-Up & Recap**: 100% spoiler-free summaries of what happened so far before starting an episode.
- 📥 **Letterboxd Data Importer (`/import`)**:
  - Direct import from Letterboxd `watched.csv` or public Letterboxd username RSS feeds into user watchlists and history.
- 📚 **Curated Collections & Lists (`/collections`)**:
  - Create and discover custom Letterboxd-style themed cinema lists with public/private visibility and ordering.
- 📺 **Comprehensive TV Series Suite**:
  - Season accordions, episode selector grids, and smooth next/previous navigation.
- 🔖 **Personal Watchlists & User Reviews**:
  - Fast bookmarking with Row Level Security (RLS) and interactive 1–10 star scoring with community reviews.
- 🛡️ **Security & Anti-Bot Architecture**:
  - Cloudflare Turnstile verification on auth actions, Upstash Redis sliding window rate limits, and secure server-only credentials.

---

## 🎨 Design System & Themes

Veyra abandons generic neon glows in favor of a handcrafted, tactile boutique cinema aesthetic:

| Token | Obsidian Dark Mode (🌙) | Sakura Light Mode (🌸) |
|---|---|---|
| **Background** | `#0A0A0A` (Matte Obsidian) | `#FDF4F6` (Pastel Blush) |
| **Card Surface** | `#141414` (Deep Charcoal) | `#FFFFFF` (Pure Porcelain) |
| **Surface Alt** | `#1E1E1E` (Dark Slate) | `#F6E3E9` (Soft Rosé) |
| **Borders** | `#2A2A2A` (Hairline Smoke) | `#E8BFCC` (Delicate Rose Gold) |
| **Accent Brand** | `#EF7B44` (35mm Film Warm Amber) | `#D96A8A` (Cherry Blossom Pink) |
| **Primary Text** | `#FFFFFF` (Crisp White) | `#231217` (High Contrast Espresso, 16:1) |
| **Secondary Text**| `#B0B0B0` (Muted Grey) | `#58333F` (Deep Plum, 8:1) |
| **Muted Text** | `#707070` (Subtle Grey) | `#7A505E` (Warm Mauve, 5.1:1 AA) |
| **Texture Overlay**| `/images/background_tile.png` (8.5%) | `/images/background_tile_sakura.png` (7.5%) |
| **Film Grain** | `/images/film_grain.png` (Monochrome 35mm) | `/images/film_grain.png` (Monochrome 35mm) |

- **Zero-FOUC Guarantee**: Inline script reads `localStorage.getItem('veyra_theme')` in `<head>` before initial paint.
- **Universal Cinema-Dark Engine**: Protects video players, HUDs, and poster hover overlays from theme bleaching, ensuring white controls remain white over dark media.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, Server Components by default, Turbopack |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) | Strict mode, zero `any` leaks, end-to-end type safety |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | CSS-variable bound theme tokens, dual-palette reactive utilities |
| **Typography** | Google Fonts | `Space Grotesk` (Headings) + `Inter` (Body typography) |
| **Database & Auth** | [Supabase](https://supabase.com/) | PostgreSQL, Row Level Security (RLS), SSR Cookie Auth |
| **AI Intelligence** | Smart AI Engine | Instant intelligent movie recommendations & trivia |
| **Media Engine** | Custom Cinema Engine | Server-only cached client for movies, TV, and posters |
| **Subtitle Engine** | Subtitle Engine | Automated multi-language subtitle finder & streaming proxy |
| **Bot Protection** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | Anti-bot verification on authentication routes |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) | Sliding window limiter on API endpoints |
| **Animations** | [Motion](https://motion.dev/) | Smooth drawer transitions and card entrance animations |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **pnpm**, or **yarn**
- **Cinema API Access Token**
- **Supabase Project** (from [Supabase](https://supabase.com))
- *(Optional)* **AI API Key** for AI movie recommendations and trivia

### 1. Clone the repository

```bash
git clone https://github.com/chittranshsharma/veyra.git
cd veyra
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Cinema Catalog API
CINEMA_API_KEY=your_catalog_access_token
NEXT_PUBLIC_MEDIA_IMAGE_BASE=https://images.catalog.media/t/p

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Engine (Optional)
GROQ_API_KEY=your_ai_api_key

# Cloudflare Turnstile (Optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Upstash Redis (Optional)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
veyra/
├── app/
│   ├── admin/                         # Admin dashboard & moderation
│   ├── api/
│   │   ├── ai/                        # Groq AI endpoints (recommend, xray, recap)
│   │   ├── collections/               # Curated collections endpoints
│   │   ├── import/letterboxd/         # Letterboxd CSV/RSS importer
│   │   ├── progress/                  # Watch progress sync
│   │   ├── reviews/                   # Reviews & ratings CRUD
│   │   ├── stats/                     # Cinema Wrapped & analytics endpoint
│   │   ├── subtitles/                 # Automated internet subtitle scraper & CORS proxy
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
│   ├── groq/client.ts                 # Groq LPU API client
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

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
