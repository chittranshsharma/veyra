import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef } from "react";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md font-medium tracking-[-0.01em]",
    "transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
    "disabled:pointer-events-none disabled:opacity-45",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-[var(--on-accent)] border border-accent/80 shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_2px_8px_var(--accent-glow)] hover:brightness-[1.03]",
        secondary:
          "border border-border bg-surface text-text-primary hover:bg-surface2 hover:border-border-hover",
        ghost:
          "text-muted hover:text-text-primary hover:bg-surface2/70",
        outline:
          "border border-border bg-transparent text-text-primary hover:bg-surface hover:border-border-hover",
        danger:
          "border border-red-500/20 bg-red-500/[0.07] text-red-400 hover:bg-red-500/12 hover:border-red-500/30",
        ai:
          "border border-purple-500/20 bg-purple-500/[0.07] text-purple-300 hover:bg-purple-500/12 hover:border-purple-500/35",
        subtle:
          "border border-border/60 bg-surface/60 text-text-secondary backdrop-blur-sm hover:bg-surface hover:text-text-primary hover:border-border",
      },
      size: {
        xs: "h-7 px-2.5 text-xs gap-1",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-sm",
        xl: "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
