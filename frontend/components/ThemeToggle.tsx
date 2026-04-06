"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        px-4 py-2 rounded-xl
        border border-[var(--card-border)]
        bg-[var(--card-bg)]
        text-[var(--foreground)]
        hover:shadow-md
        hover:scale-105
        transition-all duration-300
        flex items-center justify-center
        min-w-[52px]
      "
    >
      <span className="text-lg">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}