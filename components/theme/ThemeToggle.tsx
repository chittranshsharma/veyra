"use client";

import { useEffect, useState } from "react";
import { Moon, Flower2 } from "lucide-react";

type Theme = "dark" | "sakura";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("veyra_theme", theme);
  } catch {}
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("veyra_theme") as Theme | null;
      const current = document.documentElement.getAttribute("data-theme") as Theme | null;
      const initial = saved ?? current ?? "dark";
      setTheme(initial);
    } catch {
      setTheme("dark");
    }
  }, []);

  const select = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div className="h-8 w-[88px]" />;
  }

  return (
    <div className="segmented" role="group" aria-label="Theme">
      <button
        type="button"
        onClick={() => select("dark")}
        className={`segment ${theme === "dark" ? "segment-active" : ""}`}
        aria-pressed={theme === "dark"}
        title="Obsidian dark mode"
      >
        <Moon size={12} />
        <span className="hidden sm:inline">Dark</span>
      </button>
      <button
        type="button"
        onClick={() => select("sakura")}
        className={`segment ${theme === "sakura" ? "segment-active" : ""}`}
        aria-pressed={theme === "sakura"}
        title="Sakura light mode"
      >
        <Flower2 size={12} />
        <span className="hidden sm:inline">Sakura</span>
      </button>
    </div>
  );
}
