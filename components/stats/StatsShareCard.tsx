"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

interface Poster {
  id: number;
  title: string;
  poster_path: string | null;
}

interface StatsShareCardProps {
  totalHours: number;
  totalMinutes: number;
  completedMovies: number;
  completedEpisodes: number;
  avgRating: number | null;
  topGenres: { genre: string; count: number }[];
  recentPosters: Poster[];
}

const POSTER_IMAGE_BASE =
  process.env.NEXT_PUBLIC_MEDIA_IMAGE_BASE
    ? `${process.env.NEXT_PUBLIC_MEDIA_IMAGE_BASE}/w185`
    : "https://image.tmdb.org/t/p/w185";

export function StatsShareCard({
  totalHours,
  totalMinutes,
  completedMovies,
  completedEpisodes,
  avgRating,
  topGenres,
  recentPosters,
}: StatsShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const W = 1240;
    const H = 680;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect current theme
    const isDark =
      document.documentElement.getAttribute("data-theme") !== "sakura";

    // --- Palette
    const bg = isDark ? "#0A0A0A" : "#FDF2F4";
    const surface = isDark ? "#141414" : "#FFF9FA";
    const border = isDark ? "#2A2A2A" : "#EFD3DB";
    const accent = isDark ? "#EF7B44" : "#D96A8A";
    const textPrimary = isDark ? "#FFFFFF" : "#3D2B30";
    const textMuted = isDark ? "#707070" : "#B08E9A";

    // --- Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle vignette at corners
    const gradient = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * 0.8);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, isDark ? "rgba(0,0,0,0.5)" : "rgba(61,43,48,0.06)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // --- Accent edge glow (top)
    const topGlow = ctx.createLinearGradient(0, 0, W, 0);
    topGlow.addColorStop(0, "transparent");
    topGlow.addColorStop(0.5, isDark ? "rgba(239,123,68,0.12)" : "rgba(217,106,138,0.10)");
    topGlow.addColorStop(1, "transparent");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, W, 4);

    // --- Poster collage strip (left side)
    const POSTER_W = 120;
    const POSTER_H = 180;
    const POSTER_GAP = 8;
    const POSTER_Y_OFFSET = 60;
    const postersToShow = recentPosters.slice(0, 6);

    // Draw placeholder rects first (then overwrite with images)
    for (let i = 0; i < postersToShow.length; i++) {
      const px = 40 + i * (POSTER_W + POSTER_GAP);
      const py = POSTER_Y_OFFSET;

      // Rounded rect for poster
      ctx.fillStyle = surface;
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      roundedRect(ctx, px, py, POSTER_W, POSTER_H, 8);
      ctx.fill();
      ctx.stroke();
    }

    // Load images in parallel
    const imageLoads = postersToShow.map((poster, i) => {
      if (!poster.poster_path) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const px = 40 + i * (POSTER_W + POSTER_GAP);
          const py = POSTER_Y_OFFSET;
          ctx.save();
          roundedRect(ctx, px, py, POSTER_W, POSTER_H, 8);
          ctx.clip();
          ctx.drawImage(img, px, py, POSTER_W, POSTER_H);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = `${POSTER_IMAGE_BASE}${poster.poster_path}`;
      });
    });

    await Promise.all(imageLoads);

    // --- Right side content
    const RX = 40 + 6 * (POSTER_W + POSTER_GAP) + 40;
    const contentW = W - RX - 40;

    // "CINEMA WRAPPED" label
    ctx.fillStyle = accent;
    ctx.font = "700 11px 'Inter', sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("CINEMA WRAPPED", RX, 100);

    // Headline hours
    ctx.fillStyle = textPrimary;
    ctx.font = "700 72px 'Space Grotesk', 'Inter', sans-serif";
    ctx.letterSpacing = "-2px";
    ctx.fillText(`${totalHours}h`, RX, 185);
    ctx.font = "400 24px 'Inter', sans-serif";
    ctx.fillStyle = textMuted;
    ctx.letterSpacing = "0px";
    ctx.fillText(`${totalMinutes}m more of cinema`, RX, 220);

    // Divider
    ctx.fillStyle = border;
    ctx.fillRect(RX, 240, contentW, 1);

    // Stats grid
    const stats = [
      { label: "Movies", value: String(completedMovies) },
      { label: "Episodes", value: String(completedEpisodes) },
      { label: "Avg Rating", value: avgRating ? `${avgRating.toFixed(1)} ★` : "—" },
      { label: "Top Genre", value: topGenres[0]?.genre ?? "—" },
    ];

    const STAT_COL_W = contentW / 2;
    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = RX + col * STAT_COL_W;
      const sy = 268 + row * 72;

      ctx.fillStyle = textMuted;
      ctx.font = "600 10px 'Inter', sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText(stat.label.toUpperCase(), sx, sy);

      ctx.fillStyle = textPrimary;
      ctx.font = "700 26px 'Space Grotesk', 'Inter', sans-serif";
      ctx.letterSpacing = "-0.5px";
      ctx.fillText(stat.value, sx, sy + 30);
    });

    // Top genres list
    ctx.fillStyle = border;
    ctx.fillRect(RX, 420, contentW, 1);

    ctx.fillStyle = accent;
    ctx.font = "700 10px 'Inter', sans-serif";
    ctx.letterSpacing = "1.5px";
    ctx.fillText("TOP GENRES", RX, 450);

    const topThree = topGenres.slice(0, 3);
    topThree.forEach((g, i) => {
      ctx.fillStyle = textMuted;
      ctx.font = "500 13px 'Inter', sans-serif";
      ctx.letterSpacing = "0px";
      ctx.fillText(`${i + 1}. ${g.genre}`, RX + i * (contentW / 3), 475);
    });

    // --- Watermark with Logo
    try {
      const logoImg = new window.Image();
      logoImg.src = "/logo-icon.png";
      await new Promise<void>((res) => {
        logoImg.onload = () => res();
        logoImg.onerror = () => res();
      });
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 40, H - 46, 26, 26);
        ctx.fillStyle = textMuted;
        ctx.font = "600 12px 'Inter', sans-serif";
        ctx.letterSpacing = "0.5px";
        ctx.fillText("Veyra · veyra.app", 74, H - 28);
      } else {
        ctx.fillStyle = textMuted;
        ctx.font = "500 11px 'Inter', sans-serif";
        ctx.letterSpacing = "0.5px";
        ctx.fillText("Veyra · veyra.app", 40, H - 24);
      }
    } catch {
      ctx.fillStyle = textMuted;
      ctx.font = "500 11px 'Inter', sans-serif";
      ctx.letterSpacing = "0.5px";
      ctx.fillText("Veyra · veyra.app", 40, H - 24);
    }

    ctx.fillStyle = textMuted;
    ctx.textAlign = "right";
    ctx.fillText("Cinema Wrapped", W - 40, H - 28);
    ctx.textAlign = "left";

    // --- Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "veyra-cinema-wrapped.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [recentPosters, totalHours, totalMinutes, completedMovies, completedEpisodes, avgRating, topGenres]);

  return (
    <div>
      {/* Preview card */}
      <div
        ref={cardRef}
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Poster ribbon */}
        {recentPosters.length > 0 && (
          <div className="flex gap-1 p-2">
            {recentPosters.slice(0, 8).map((poster) => (
              <div
                key={poster.id}
                className="relative flex-1 rounded-lg overflow-hidden"
                style={{ aspectRatio: "2/3", minWidth: 0 }}
              >
                {poster.poster_path ? (
                  <Image
                    src={`${POSTER_IMAGE_BASE}${poster.poster_path}`}
                    alt={poster.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: "var(--bg-surface2)" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6 pt-4">
          {/* Label */}
          <p
            className="text-[10px] font-bold tracking-[3px] uppercase mb-2"
            style={{ color: "var(--accent)" }}
          >
            Cinema Wrapped
          </p>

          {/* Hero metric */}
          <div className="flex items-baseline gap-3">
            <span
              className="font-display text-6xl font-black leading-none"
              style={{ color: "var(--text-primary)", letterSpacing: "-2px" }}
            >
              {totalHours}h
            </span>
            <span
              className="text-xl font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {totalMinutes}m streamed
            </span>
          </div>

          {/* Divider */}
          <hr className="my-5" style={{ borderColor: "var(--border)" }} />

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
            {[
              { label: "Movies", value: completedMovies },
              { label: "Episodes", value: completedEpisodes },
              {
                label: "Avg Rating",
                value: avgRating ? `${avgRating.toFixed(1)} ★` : "—",
              },
              { label: "Top Genre", value: topGenres[0]?.genre ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </p>
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--text-primary)", letterSpacing: "-0.5px" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Top genres */}
          {topGenres.length > 0 && (
            <>
              <hr className="mt-5 mb-4" style={{ borderColor: "var(--border)" }} />
              <div className="flex flex-wrap gap-2">
                {topGenres.slice(0, 5).map(({ genre, count }, i) => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: i === 0 ? "var(--accent-dim)" : "var(--bg-surface2)",
                      color: i === 0 ? "var(--accent)" : "var(--text-muted)",
                      border: `1px solid ${i === 0 ? "var(--accent-mid)" : "var(--border)"}`,
                    }}
                  >
                    {i === 0 && "★ "}
                    {genre}
                    <span
                      className="opacity-60 text-[10px]"
                      style={{ color: i === 0 ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Watermark */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Image
                src="/logo-icon.png"
                alt="Veyra"
                width={18}
                height={18}
                className="h-4 w-4 object-contain"
              />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Veyra · Cinema Wrapped
              </span>
            </div>
            <span className="text-[11px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              veyra.app
            </span>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={downloadCard}
        className={buttonVariants({ variant: "primary", size: "lg", className: "mt-4 w-full" })}
        style={{
          background: "var(--accent)",
          color: "var(--on-accent)",
        }}
      >
        <Download size={16} />
        Download as PNG
      </button>
    </div>
  );
}

// Helper — draws a rounded rectangle path
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
