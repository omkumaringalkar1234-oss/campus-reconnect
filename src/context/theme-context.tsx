import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

import { Glass } from '@/constants/glass-theme';

export type ThemeMode = 'dark'; // Glass theme is dark-only

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof Glass;
  glass: typeof Glass;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'cc_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  colors: Glass,
  glass: Glass,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  // Load saved theme on mount
  useEffect(() => {
    (async () => {
      try {
        let saved: string | null = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          saved = window.localStorage.getItem(STORAGE_KEY);
        } else {
          saved = await AsyncStorage.getItem(STORAGE_KEY);
        }

        if (saved === 'dark') {
          applyTheme(saved as ThemeMode);
        }
      } catch (e) {
        console.warn('Error loading theme:', e);
      }
    })();
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    setThemeState(mode);

    // Apply HTML classes on web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
      root.setAttribute('data-theme', 'dark');
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    applyTheme(mode);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, mode);
      }
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  };

  const toggleTheme = () => {
    // Glass theme is dark-only, but keep the function for compatibility
    setTheme('dark');
  };

  const isDark = true; // Glass theme is always dark

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors: Glass,
        glass: Glass,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);