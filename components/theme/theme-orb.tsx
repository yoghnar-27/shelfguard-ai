"use client"

import { useTheme } from "./theme-context"
import { THEME_PALETTES } from "@/lib/theme"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeOrb({
  className,
  isExpanded = false,
}: {
  className?: string
  isExpanded?: boolean
}) {
  const { activeTheme, openReactor } = useTheme()
  const palette = THEME_PALETTES[activeTheme] || THEME_PALETTES.imperial_ruby

  return (
    <button
      type="button"
      onClick={openReactor}
      className={cn(
        "group relative flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer select-none",
        isExpanded ? "size-20" : "size-10 shadow-xl backdrop-blur-md border border-border/80 bg-card/90 hover:scale-110 hover:border-gold",
        className
      )}
      title="Open Theme Reactor"
      aria-label="Open Theme Reactor"
    >
      {/* Outer Breathing Glow Ring */}
      <span
        className={cn(
          "absolute -inset-1.5 rounded-full blur-md opacity-60 pointer-events-none transition-all duration-700",
          isExpanded ? "animate-ping opacity-80" : "pulse-subtle"
        )}
        style={{
          background: `radial-gradient(circle, ${palette.primaryAccent} 0%, ${palette.secondaryAccent} 100%)`,
        }}
      />

      {/* 3D Rotating Orb Core */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-700 overflow-hidden",
          isExpanded ? "size-16 rotate-12 scale-110" : "size-8"
        )}
        style={{
          background: `linear-gradient(135deg, ${palette.primaryAccent} 0%, ${palette.bg} 60%, ${palette.secondaryAccent} 100%)`,
          border: `1.5px solid ${palette.secondaryAccent}`,
        }}
      >
        {/* Particle / Light Sparkle overlay */}
        <Sparkles
          className={cn(
            "text-foreground transition-all duration-500",
            isExpanded ? "size-8 animate-spin" : "size-4"
          )}
          style={{ animationDuration: "12s" }}
        />
      </div>
    </button>
  )
}
