import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const themes = [
  { id: "seagreen", name: "Sea Green", dot: "#67B992", previewBg: "#E3F2E9" },
  { id: "light",    name: "Classic Light", dot: "#0D9488", previewBg: "#F8FAFC" },
  { id: "dark",     name: "Midnight Dark", dot: "#2DD4BF", previewBg: "#0B0F17" },
  { id: "beige",    name: "Sand Beige",   dot: "#A4783E", previewBg: "#F7F2E7" },
  { id: "pink",     name: "Rose Pink",    dot: "#D47A9A", previewBg: "#FAF5F6" },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("deen360_theme") || "seagreen";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("deen360_theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);