import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS-variable-driven tokens — reactive to both Dark & Sakura themes
        background: "var(--bg-base)",
        surface:    "var(--bg-surface)",
        surface2:   "var(--bg-surface2)",
        border:     "var(--border)",
        accent:     "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        muted:      "var(--text-muted)",
        // Semantic text colours
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
        // Status colours
        success: "var(--success)",
        error:   "var(--error)",
        star:    "var(--star-color)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body:    ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      borderColor: {
        DEFAULT:  "var(--border)",
        subtle:   "var(--border)",
        hover:    "var(--border-hover)",
        accent:   "var(--accent-mid)",
      },
    },
  },
  plugins: [],
};

export default config;
