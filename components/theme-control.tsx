"use client";

import { useState } from "react";
import { THEME_COOKIE, THEMES, type Theme } from "@/lib/theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeControl({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex h-8 items-center gap-0.5 rounded-lg border border-line bg-canvas p-0.5 text-[0.6875rem]"
    >
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          onClick={() => choose(t)}
          className={`h-full rounded-md px-2.5 capitalize ${
            theme === t ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
