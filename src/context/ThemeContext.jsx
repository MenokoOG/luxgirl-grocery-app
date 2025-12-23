import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider
 *
 * Responsibilities:
 * - persist theme choice in localStorage key 'lux_list_theme'
 * - default to system preference when no choice present
 * - toggle between dark and light by setting 'dark' class or 'light-mode' on <html>
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('lux_list_theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      // fallback to system preference
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light-mode');
      localStorage.setItem('lux_list_theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light-mode');
      localStorage.setItem('lux_list_theme', 'light');
    }
  }, [isDark]);

  // expose helpers for more explicit control if parent wants them
  const value = {
    isDark,
    toggle: () => setIsDark(v => !v),
    setDark: () => setIsDark(true),
    setLight: () => setIsDark(false)
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}