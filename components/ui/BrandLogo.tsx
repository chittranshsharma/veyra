import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "horizontal" | "icon-only" | "full-studio";
  showTagline?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  size = "md",
  variant = "horizontal",
  showTagline = false,
  href = "/",
  className = "",
  priority = false,
}: BrandLogoProps) {
  if (variant === "full-studio") {
    const studioSizes = {
      sm: { w: 120, h: 108 },
      md: { w: 180, h: 162 },
      lg: { w: 240, h: 216 },
      xl: { w: 320, h: 288 },
    };
    const { w, h } = studioSizes[size];

    const fullContent = (
      <div className={`group flex flex-col items-center text-center ${className}`}>
        <Image
          src="/logo.png"
          alt="Veyra — Cinema Lives Here"
          width={w}
          height={h}
          priority={priority}
          className="object-contain transition-transform duration-300 group-hover:scale-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
          style={{ width: `${w}px`, height: "auto" }}
        />
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="inline-flex shrink-0">
          {fullContent}
        </Link>
      );
    }
    return fullContent;
  }

  const emblemSizes = {
    sm: { w: 26, h: 26, text: "text-lg", gap: "gap-2" },
    md: { w: 32, h: 32, text: "text-xl", gap: "gap-2.5" },
    lg: { w: 42, h: 42, text: "text-2xl", gap: "gap-3" },
    xl: { w: 56, h: 56, text: "text-3xl", gap: "gap-3.5" },
  };

  const { w, h, text, gap } = emblemSizes[size];

  const content = (
    <div className={`group inline-flex items-center ${gap} ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/logo-icon.png"
          alt="Veyra emblem"
          width={w}
          height={h}
          priority={priority}
          className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          style={{ width: `${w}px`, height: `${h}px` }}
        />
      </div>
      {variant !== "icon-only" && (
        <div className="flex flex-col">
          <span
            className={`font-display font-bold tracking-tight leading-none ${text}`}
            style={{ color: "var(--text-primary)" }}
          >
            <span style={{ color: "var(--accent)" }}>V</span>EYRA
          </span>
          {showTagline && (
            <span className="text-[9px] tracking-[0.2em] font-semibold uppercase text-muted mt-1 leading-none">
              Cinema Lives Here
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
