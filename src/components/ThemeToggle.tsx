'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => (localStorage.getItem('theme') === 'light' ? 'light' : 'dark'),
    () => 'dark'
  );

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-violet-600" />
      )}
    </button>
  );
}
