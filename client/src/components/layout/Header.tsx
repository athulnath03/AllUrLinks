"use client";

import type { Session } from "@supabase/supabase-js";
import { LogIn, LogOut } from "lucide-react";

import ThemeSelector, {
  type Theme,
} from "@/components/common/ThemeSelector";

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isSupabaseConfigured: boolean;
  session: Session | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Header({
  theme,
  onThemeChange,
  isSupabaseConfigured,
  session,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="relative mx-auto flex max-w-[1180px] items-center justify-between px-[34px] py-6 max-[520px]:px-[17px] max-[520px]:py-[18px]">
      {/* Logo / branding */}
      <div className="flex items-center gap-[9px] text-[14px] font-[750] tracking-[-0.02em]">
        <span>LynkHive</span>
      </div>

      <div className="flex items-center gap-[10px]">
        {/* Theme selector */}
        <ThemeSelector
          theme={theme}
          onChange={onThemeChange}
        />

        {/* Account */}
        {isSupabaseConfigured ? (
          session ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] py-1 pl-1 pr-[10px] shadow-[0_4px_14px_rgba(27,38,31,0.04)] transition duration-[180ms] ease-in hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] hover:bg-[var(--surface)] hover:shadow-[0_6px_18px_rgba(27,38,31,0.07)]">
              <button
                type="button"
                className="h-[30px] w-[30px] flex-none overflow-hidden rounded-full border-0 bg-[var(--accent-soft)] p-0 text-[var(--accent)]"
                title={
                  session.user.user_metadata?.user_name ||
                  session.user.user_metadata?.preferred_username ||
                  session.user.email ||
                  "GitHub user"
                }
              >
                <img
                  className="block h-full w-full object-cover"
                  src={
                    session.user.user_metadata?.avatar_url ||
                    session.user.user_metadata?.picture
                  }
                  alt={
                    session.user.user_metadata?.user_name ||
                    session.user.user_metadata?.preferred_username ||
                    "GitHub avatar"
                  }
                />
              </button>

              <span className="block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-[650] tracking-[-0.01em] text-[var(--ink)] max-[520px]:hidden">
                @
                {session.user.user_metadata?.user_name ||
                  session.user.user_metadata?.preferred_username ||
                  "user"}
              </span>

              <button
                type="button"
                className="ml-0.5 grid h-[27px] w-[27px] place-items-center rounded-full border-0 bg-transparent text-[var(--muted)] transition duration-[180ms] ease-in hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                onClick={onSignOut}
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--ink)] transition duration-[180ms] ease-in hover:border-[var(--accent)] active:scale-[0.97]"
              onClick={onSignIn}
            >
              <LogIn size={16} />
              Sign in with Github
            </button>
          )
        ) : (
          <span className="rounded-[99px] bg-[var(--accent-soft)] px-[10px] py-[7px] text-[11px] font-bold tracking-[0.02em] text-[var(--accent)]">
            Preview mode
          </span>
        )}
      </div>
    </header>
  );
}