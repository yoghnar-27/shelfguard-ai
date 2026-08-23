"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/theme-context"
import { ThemeReactor } from "@/components/theme/theme-reactor"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <ThemeProvider>
        <TooltipProvider delay={200}>
          {children}
          <ThemeReactor />
          <Toaster theme="dark" position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </NextThemesProvider>
  )
}
