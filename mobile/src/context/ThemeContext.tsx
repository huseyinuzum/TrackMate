import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { colors, ThemeType } from '../theme/colors';

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
  themeColors: typeof colors.dark;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  toggleTheme: () => {},
  themeColors: colors.dark,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark'); // Varsayılan dark

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const themeColors = theme === 'dark' ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
