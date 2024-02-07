import React, {useEffect, useState} from 'react';
import {BsSunFill, BsMoonStarsFill} from 'react-icons/bs';

const ThemeSwitcher: React.FC = () => {
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
      className={`p-2 ml-2 text-primary rounded-full border border-primary cursor-pointer transition-transform duration-500 ease-in-out ${
        theme === 'light' ? 'bg-blue-green' : 'bg-lilac'
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

export default ThemeSwitcher;
