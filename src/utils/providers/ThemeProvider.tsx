import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Theme } from '~/constants/themes';
import { keys } from '~/utils/ramda';

interface ProvidersProps {}

const ThemeContext = createContext({
  theme: Theme.Default,
  setTheme: (theme: Theme) => {},
});

const themeClass: Record<Theme, string> = {
  [Theme.Default]: '',
  [Theme.Horizon]: 'theme-horizon',
};

const ThemeProvider: FC<ProvidersProps> = ({ children }) => {
  const [theme, setTheme] = useState(Theme.Default);
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  useEffect(() => {
    const stored = localStorage.getItem('vault__theme');
    if (!stored || !keys(themeClass).includes(stored as Theme)) {
      return;
    }
    setTheme(stored as Theme);
  }, []);

  useEffect(() => {
    if (!themeClass[theme]) {
      return;
    }

    document.documentElement.classList.add(themeClass[theme]);

    try {
      localStorage.setItem('vault__theme', theme);
    } catch {}

    return () => document.documentElement.classList.remove(themeClass[theme]);
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export { ThemeProvider };
