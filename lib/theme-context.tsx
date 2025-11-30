"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  logoSrc: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const [fading, setFading] = useState(false)
  const lastToggleRef = useRef<number>(0)

  useEffect(() => {
    const savedTheme = localStorage.getItem("budget-tracker-theme") as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
    // Enable smooth transitions only after initial theme is applied to avoid first-load flash
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-transition-enabled")
    })
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("budget-tracker-theme", newTheme)
    // Temporarily add a class to trigger transition (already enabled after mount)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    // Trigger overlay fade animation only if not toggled very recently
    const now = performance.now()
    if (now - lastToggleRef.current > 800) {
      setFading(true)
      setTimeout(() => setFading(false), 240)
    }
    lastToggleRef.current = now
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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, logoSrc }}>
      {children}
      {fading && <div aria-hidden className="theme-fade-overlay" />}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
