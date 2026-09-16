import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent" | "muted";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        background:
          variant === "accent"
            ? "var(--accent-dim)"
            : variant === "muted"
            ? "var(--bg-surface2)"
            : "var(--bg-surface2)",
        color:
          variant === "accent"
            ? "var(--accent)"
            : variant === "muted"
            ? "var(--text-muted)"
            : "var(--text-primary)",
        border:
          variant === "accent"
            ? "1px solid var(--accent-mid)"
            : "1px solid var(--border)",
      }}
    >
      {children}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: number }) {
  const score = rating.toFixed(1);
  const color =
    rating >= 7.5
      ? "#22C55E"
      : rating >= 5.5
      ? "var(--star-color)"
      : "#EF4444";

  return (
    <span className="text-sm font-semibold" style={{ color }}>
      ★ {score}
    </span>
  );
}
