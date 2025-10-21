"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeColor, themeColors, defaultThemeColor } from "@/lib/theme-colors";

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(
  undefined
);

export function ThemeColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeColor, setThemeColorState] =
    useState<ThemeColor>(defaultThemeColor);
  const [mounted, setMounted] = useState(false);

  // Load theme color from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme-color") as ThemeColor;
    if (stored && themeColors.find((t) => t.value === stored)) {
      setThemeColorState(stored);
    }
  }, []);

  // Apply theme color to document
  useEffect(() => {
    if (!mounted) return;

    const theme = themeColors.find((t) => t.value === themeColor);
    if (!theme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains("dark");

    const colors = isDark ? theme.dark : theme.light;

    // Set CSS variables
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);

    // Add data attribute and class for CSS selectors
    root.setAttribute("data-theme-color", themeColor);

    // Remove previous theme color classes
    root.classList.remove(
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-red"
    );

    // Add current theme color class
    root.classList.add(`theme-${themeColor}`);

    localStorage.setItem("theme-color", themeColor);

    console.log("Theme color applied:", {
      color: themeColor,
      isDark,
      primary: colors.primary,
      primaryForeground: colors.primaryForeground,
      className: `theme-${themeColor}`,
    });
  }, [themeColor, mounted]);

  // Listen to theme mode changes (light/dark)
  useEffect(() => {
    if (!mounted) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          // Re-apply colors when theme mode changes
          const theme = themeColors.find((t) => t.value === themeColor);
          if (!theme) return;

          const root = document.documentElement;
          const isDark = root.classList.contains("dark");
          const colors = isDark ? theme.dark : theme.light;

          root.style.setProperty("--primary", colors.primary);
          root.style.setProperty(
            "--primary-foreground",
            colors.primaryForeground
          );
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [themeColor, mounted]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}
