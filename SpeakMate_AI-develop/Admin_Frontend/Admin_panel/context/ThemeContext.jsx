import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const ACCENT_COLOR_MAP = {
  purple: { primary: "#9333ea", hover: "#7e22ce" },
  indigo: { primary: "#4f46e5", hover: "#4338ca" },
  rose: { primary: "#e11d48", hover: "#be123c" },
  blue: { primary: "#2563eb", hover: "#1d4ed8" },
  emerald: { primary: "#059669", hover: "#047857" },
  amber: { primary: "#d97706", hover: "#b45309" },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("speakmate_admin_theme") === "dark";
  });

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem("speakmate_admin_accent") || "purple";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("speakmate_admin_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("speakmate_admin_theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = ACCENT_COLOR_MAP[accent] || ACCENT_COLOR_MAP.purple;
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-hover", colors.hover);
    localStorage.setItem("speakmate_admin_accent", accent);
  }, [accent]);

  const [sidebarDensity, setSidebarDensity] = useState(() => {
    return localStorage.getItem("speakmate_admin_sidebar_density") || "comfortable";
  });

  useEffect(() => {
    localStorage.setItem("speakmate_admin_sidebar_density", sidebarDensity);
  }, [sidebarDensity]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const theme = isDark ? "dark" : "light";
  const setTheme = (val) => setIsDark(val === "dark");

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      theme,
      setTheme,
      accent,
      setAccent,
      sidebarDensity,
      setSidebarDensity
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
