"use client";

import { Monitor, Moon, Sun } from "lucide-react";

export type Theme = "system" | "light" | "dark";

interface ThemeSelectorProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export default function ThemeSelector({
  theme,
  onChange,
}: ThemeSelectorProps) {
  return (
    <div className="flex shrink-0 items-center gap-0 rounded-[50px] border border-[var(--line)] bg-[var(--surface)] p-[3px]">
      <button
        type="button"
        onClick={() => onChange("light")}
        aria-label="Light theme"
        title="Light"
        className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[7px] transition ${
          theme === "light"
            ? "bg-[var(--surface-2)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        <Sun size={15} />
      </button>

      <button
        type="button"
        onClick={() => onChange("system")}
        aria-label="System theme"
        title="System"
        className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[7px] transition ${
          theme === "system"
            ? "bg-[var(--surface-2)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        <Monitor size={15} />
      </button>

      <button
        type="button"
        onClick={() => onChange("dark")}
        aria-label="Dark theme"
        title="Dark"
        className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[7px] transition ${
          theme === "dark"
            ? "bg-[var(--surface-2)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        <Moon size={15} />
      </button>
    </div>
  );
}