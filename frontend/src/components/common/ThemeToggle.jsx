import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all active:scale-90 border-2 focus:outline-none ${
        theme === 'dark'
          ? 'bg-slate-950 border-white text-slate-400 hover:text-white hover:bg-slate-900 shadow-md shadow-black/40'
          : 'bg-white border-slate-900 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-md shadow-slate-200'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} strokeWidth={2} />
      ) : (
        <Moon size={20} strokeWidth={2} />
      )}
    </button>
  );
}
