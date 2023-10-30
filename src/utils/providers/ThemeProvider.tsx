import React, {
  createContext,
  FC,
  useCallback,
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
  const [theme, setThemeValue] = useState(Theme.Default);

  const setTheme = useCallback(
    (val: Theme) => {
      if (themeClass[theme]) {
        document.documentElement.classList.remove(themeClass[theme]);
      }

      localStorage.setItem('vault__theme', val);
      setThemeValue(val);

      if (themeClass[val]) {
        document.documentElement.classList.add(themeClass[val]);
      }
    },
    [theme],
  );

  useEffect(() => {
    const stored = localStorage.getItem('vault__theme');

    if (!stored || !keys(themeClass).includes(stored as Theme)) {
      return;
    }

    setTheme(stored as Theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export { ThemeProvider };
