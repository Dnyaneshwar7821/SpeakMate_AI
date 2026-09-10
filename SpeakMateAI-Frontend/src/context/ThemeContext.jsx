import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants/app";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Only use dark mode if explicitly chosen by the user in Settings; otherwise default to "light"
    const explicit = localStorage.getItem("speakmate_theme_explicit") === "true";
    if (!explicit) return "light";
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    localStorage.setItem("speakmate_theme_explicit", "true");
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSetTheme = (newTheme) => {
    localStorage.setItem("speakmate_theme_explicit", "true");
    setTheme(newTheme);
  };

  const isDark = theme === "dark";
  const value = { theme, isDark, toggleTheme, setTheme: handleSetTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export default ThemeContext;
