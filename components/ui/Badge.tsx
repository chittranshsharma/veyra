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
        {
          "bg-white/10 text-white": variant === "default",
          "bg-accent/15 text-accent": variant === "accent",
          "bg-surface2 text-muted": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: number }) {
  const score = rating.toFixed(1);
  const color =
    rating >= 7.5
      ? "text-green-400"
      : rating >= 5.5
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <span className={clsx("text-sm font-semibold", color)}>★ {score}</span>
  );
}
