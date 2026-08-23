"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { applyTheme, normalizeThemeId, type ThemePaletteId } from "@/lib/theme"

interface ThemeContextType {
  activeTheme: ThemePaletteId
  isOpen: boolean
  isWaveActive: boolean
  openReactor: () => void
  closeReactor: () => void
  selectTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Deterministic initial theme on SSR and first client render
  const [activeTheme, setActiveTheme] = useState<ThemePaletteId>("imperial_ruby")
  const [isOpen, setIsOpen] = useState(false)
  const [isWaveActive, setIsWaveActive] = useState(false)

  // Restore saved theme asynchronously AFTER hydration completes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("shelfguard_theme")
        const validId = normalizeThemeId(saved)
        setActiveTheme(validId)
        applyTheme(validId)
      } catch {
        applyTheme("imperial_ruby")
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  function openReactor() {
    setIsOpen(true)
  }

  function closeReactor() {
    setIsOpen(false)
  }

  function selectTheme(rawThemeId: string) {
    const themeId = normalizeThemeId(rawThemeId)
    if (themeId === activeTheme) {
      setIsOpen(false)
      return
    }

    // Trigger Color Wave Ripple Effect
    setIsWaveActive(true)
    setActiveTheme(themeId)
    applyTheme(themeId)

    setTimeout(() => {
      setIsWaveActive(false)
      setIsOpen(false)
    }, 700)
  }

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        isOpen,
        isWaveActive,
        openReactor,
        closeReactor,
        selectTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
