/**
 * context/ThemeContext.jsx
 *
 * WHY THIS EXISTS:
 * Theme state needs to be accessible by every component in the tree.
 * Instead of prop-drilling `isDark` through 10 layers, any component
 * can call `useTheme()` and get the current theme + toggle function.
 *
 * Persists to localStorage so the user's preference survives page reloads.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@constants/app";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Restore persisted preference, default to dark
    return localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  });

  // Apply theme attribute to <html> element so CSS variables take effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  const value = { theme, isDark, toggleTheme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme — consumes ThemeContext
 * @returns {{ theme: string, isDark: boolean, toggleTheme: () => void }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export default ThemeContext;
