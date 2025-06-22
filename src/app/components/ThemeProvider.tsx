"use client";

import { useState, useEffect, createContext, useContext } from "react";

// 🔹 Criando um contexto para o tema
const ThemeContext = createContext<
  { darkMode: boolean; toggleTheme: () => void } | undefined
>(undefined);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(true); // 🔹 Define darkMode como `true` por padrão

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 🔹 Hook para acessar o tema na Navbar
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
