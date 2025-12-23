import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider
 * - variant: 'crimson' | 'azure'
 * - toggleVariant() cycles between crimson <-> azure
 * - setVariant(v) sets explicit variant
 * - isDark is always true (app runs in dark theme only)
 *
 * Persisted keys:
 * - lux_list_theme_variant
 * - lux_list_large_mode (optional UI accessibility flag)
 * - lux_list_reduced_motion
 */
export function ThemeProvider({ children }) {
  const initialVariant = (() => {
    try {
      return localStorage.getItem('lux_list_theme_variant') || 'crimson';
    } catch (e) {
      return 'crimson';
    }
  })();

  const [variant, setVariantState] = useState(initialVariant); // 'crimson' | 'azure'
  const isDark = true;

  // Accessibility toggles persisted too
  const [largeMode, setLargeModeState] = useState(() => {
    try { return localStorage.getItem('lux_list_large_mode') === '1'; } catch { return false; }
  });
  const [reducedMotion, setReducedMotionState] = useState(() => {
    try { return localStorage.getItem('lux_list_reduced_motion') === '1'; } catch { return false; }
  });

  useEffect(() => {
    // ensure dark mode class always present
    document.documentElement.classList.add('dark');
    // set theme variant class
    document.documentElement.classList.remove('theme-crimson', 'theme-azure');
    document.documentElement.classList.add(`theme-${variant}`);

    try { localStorage.setItem('lux_list_theme_variant', variant); } catch (e) { }

  }, [variant]);

  useEffect(() => {
    if (largeMode) document.documentElement.classList.add('large-mode');
    else document.documentElement.classList.remove('large-mode');
    try { localStorage.setItem('lux_list_large_mode', largeMode ? '1' : '0'); } catch (e) { }
  }, [largeMode]);

  useEffect(() => {
    if (reducedMotion) document.documentElement.classList.add('reduced-motion');
    else document.documentElement.classList.remove('reduced-motion');
    try { localStorage.setItem('lux_list_reduced_motion', reducedMotion ? '1' : '0'); } catch (e) { }
  }, [reducedMotion]);

  function setVariant(v) {
    if (v !== 'crimson' && v !== 'azure') return;
    setVariantState(v);
  }

  function toggleVariant() {
    setVariantState(prev => (prev === 'crimson' ? 'azure' : 'crimson'));
  }

  return (
    <ThemeContext.Provider value={{
      isDark,
      variant,
      setVariant,
      toggleVariant,
      largeMode,
      setLargeMode: setLargeModeState,
      reducedMotion,
      setReducedMotion: setReducedMotionState
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}