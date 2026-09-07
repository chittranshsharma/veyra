import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-background hover:brightness-110 active:scale-95",
        secondary:
          "bg-surface text-white hover:bg-surface2 active:scale-95",
        ghost:
          "text-muted hover:bg-surface hover:text-white active:scale-95",
        outline:
          "border border-white/10 text-white hover:border-accent/40 hover:bg-surface active:scale-95",
        danger:
          "bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 rounded-lg",
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
