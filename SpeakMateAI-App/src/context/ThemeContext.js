import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext({
  isDark: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
  theme: {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDarkState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('speakmate_dark_mode').then((val) => {
      if (val !== null) {
        setIsDarkState(val === 'true');
      }
    });
  }, []);

  const setDarkMode = async (value) => {
    const boolVal = Boolean(value);
    setIsDarkState(boolVal);
    await AsyncStorage.setItem('speakmate_dark_mode', String(boolVal));
  };

  const toggleDarkMode = async () => {
    const newVal = !isDark;
    setIsDarkState(newVal);
    await AsyncStorage.setItem('speakmate_dark_mode', String(newVal));
  };

  const theme = {
    isDark,
    bg: isDark ? '#0F172A' : '#F8FAFC',
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    cardBorder: isDark ? '#334155' : '#F1F5F9',
    textPrimary: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    inputBg: isDark ? '#1E293B' : '#F1F5F9',
    headerBg: isDark ? '#0F172A' : '#FFFFFF',
    navBg: isDark ? '#0F172A' : '#FFFFFF',
    accent: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
