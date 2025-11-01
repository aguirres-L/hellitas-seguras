import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Definimos el contexto y el tipo de datos que va a exponer
const ThemeContext = createContext();

// 2. Custom hook para consumir el contexto (con validación)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

// 3. Provider que maneja el estado y la lógica
export const ThemeProvider = ({ children }) => {
  const [typeTheme, setTypeTheme] = useState('light');

  // Persistencia en localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTypeTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', typeTheme);
  }, [typeTheme]);

  // Alternar entre light/dark
  const toggleTheme = () => {
    setTypeTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ typeTheme, setTypeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};