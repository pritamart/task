'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';

const ThemeCtx = createContext({ theme: 'system', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'system';
    setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}