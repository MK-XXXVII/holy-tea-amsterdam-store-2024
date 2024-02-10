import React, {useEffect, useState} from 'react';
import {BsSunFill, BsMoonStarsFill} from 'react-icons/bs';

export const ThemeSwitcher: React.FC<{isHome: boolean}> = ({isHome}) => {
  const [theme, setTheme] = useState('light');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.className = `${storedTheme}`;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = `${newTheme}`;
    setPulse(!pulse);
  };

  return (
    <div
      onClick={toggleTheme}
      onKeyDown={toggleTheme}
      role="button"
      tabIndex={0}
      className={`p-2 ml-2 rounded-full border-2 border-primary text-primary cursor-pointer transition-transform duration-500 ease-in-out ${
        isHome ? 'bg-blue-green dark:bg-lilac' : 'bg-lilac dark:bg-blue-green'
      }`}
    >
      {theme === 'light' ? (
        <BsMoonStarsFill
          className={`h-5 w-5 ${pulse ? 'animate-pulse' : ''}`}
        />
      ) : (
        <BsSunFill className={`h-5 w-5 ${pulse ? 'animate-pulse' : ''}`} />
      )}
    </div>
  );
};
