import React, { useEffect, useState } from 'react';

// Simple theme toggle component with animated switch
// Persists choice in localStorage under 'theme'
// Supports 'light', 'dark', 'cyberpunk', 'solarized'

export const ThemeToggle: React.FC = () => {
  const themes = ['light', 'dark', 'cyberpunk', 'solarized'] as const;
  const [current, setCurrent] = useState<string>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && themes.includes(saved as any)) {
      setCurrent(saved);
      document.body.className = '';
      document.body.classList.add(`theme-${saved}`);
    } else {
      // default to light
      document.body.classList.add('theme-light');
    }
  }, []);

  const toggle = () => {
    const idx = themes.indexOf(current as any);
    const next = themes[(idx + 1) % themes.length];
    setCurrent(next);
    localStorage.setItem('theme', next);
    // reset body classes then apply new theme
    document.body.className = '';
    document.body.classList.add(`theme-${next}`);
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
    >
      Theme: {current}
    </button>
  );
};
