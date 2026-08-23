"use client"

import { useEffect } from "react"
import { useTheme } from "./theme-context"
import { THEME_PALETTES, type ThemePaletteId } from "@/lib/theme"
import { ThemeOrb } from "./theme-orb"
import { Check, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeReactor() {
  const { activeTheme, isOpen, isWaveActive, closeReactor, selectTheme } = useTheme()

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeReactor()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeReactor])

  if (!isOpen && !isWaveActive) return null

  const currentPalette = THEME_PALETTES[activeTheme] || THEME_PALETTES.imperial_ruby

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Backdrop Darkening Layer */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in"
        onClick={closeReactor}
      />

      {/* 2. Color Wave Ripple Animation */}
      {isWaveActive ? (
        <div
          className="absolute size-[160vmax] rounded-full pointer-events-none animate-ping opacity-60 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${currentPalette.primaryAccent} 0%, ${currentPalette.secondaryAccent} 40%, transparent 70%)`,
          }}
        />
      ) : null}

      {/* 3. Radial Ambient Light Burst */}
      <div
        className="pointer-events-none absolute size-96 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${currentPalette.primaryAccent} 0%, ${currentPalette.secondaryAccent} 100%)`,
        }}
      />

      {/* 4. Central Theme Reactor Modal Container */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-gold/30 bg-card/95 p-6 shadow-2xl backdrop-blur-2xl hairline space-y-6 animate-in zoom-in-95 duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-gold animate-pulse" />
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Theme Reactor</h2>
              <p className="text-xs text-muted-foreground">Select a luxury retail color language</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeReactor}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close theme reactor"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Center 3D Expanded Orb Focus */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <ThemeOrb isExpanded />
          <p className="text-xs font-mono font-semibold tracking-wider text-gold uppercase pt-1">
            Active: {currentPalette.name}
          </p>
        </div>

        {/* 8 Orbital Theme Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-h-[50vh] overflow-y-auto pr-1">
          {Object.values(THEME_PALETTES).map((p) => {
            const isSelected = p.id === activeTheme
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectTheme(p.id as ThemePaletteId)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 cursor-pointer card-hover",
                  isSelected
                    ? "border-gold bg-gold/15 shadow-lg shadow-gold/10 ring-1 ring-gold/40"
                    : "border-border/60 bg-background/50 hover:border-gold/50 hover:bg-muted/40"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                      {p.name}
                    </p>
                    {isSelected ? <Check className="size-3.5 text-gold" /> : null}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                    {p.subtitle}
                  </p>
                </div>

                {/* Primary + Secondary Swatch Pills */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">Accent</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ background: p.primaryAccent }}
                      title="Primary Accent"
                    />
                    <span
                      className="size-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ background: p.secondaryAccent }}
                      title="Secondary Accent"
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
