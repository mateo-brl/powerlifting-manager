import { useState, useEffect, useCallback } from 'react';
import type { ThemeConfig } from 'antd';
import { lightTheme, darkTheme } from './index';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'pl-manager-theme';

/**
 * Hook for managing theme (light/dark mode)
 */
export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Get stored preference or default to system
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    return stored || 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Update isDark when themeMode changes
  useEffect(() => {
    if (themeMode === 'light') {
      setIsDark(false);
    } else if (themeMode === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.backgroundColor = isDark ? '#1A1A1A' : '#F5F5F5';
    document.body.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setThemeMode((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'light';
      // If system, toggle to opposite of current
      return isDark ? 'light' : 'dark';
    });
  }, [isDark]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, []);

  const theme: ThemeConfig = isDark ? darkTheme : lightTheme;

  return {
    theme,
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
  };
}
