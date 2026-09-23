import React, { createContext, useContext } from "react";

type Theme = "system" | "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  theme = "dark",
  switchable = true,
}: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
