"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  logoSrc: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme based on saved preference or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const savedTheme = localStorage.getItem("budget-tracker-theme") as Theme | null
    if (savedTheme) return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Ensure the document class matches the initial theme
    document.documentElement.classList.toggle("dark", theme === "dark")
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("budget-tracker-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  const logoSrc = theme === "dark" ? "/logos/logo-dark.svg" : "/logos/logo-light.svg"

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, logoSrc }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
