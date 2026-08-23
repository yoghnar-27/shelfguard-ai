"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  HeartPulse,
  LayoutDashboard,
  Sparkles,
} from "lucide-react"
import { BrandLogo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

const primaryNav = [
  { href: "/", label: "Scan", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Box },
  { href: "/opportunities", label: "Opportunities", icon: Sparkles },
]

const secondaryNav: Array<{ href: string; label: string; icon: typeof HeartPulse }> = []

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border/60">
        <BrandLogo size="md" />
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3 pt-4 space-y-4">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
            Intelligence
          </p>
          {primaryNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-gold/15 via-gold/5 to-transparent text-foreground shadow-[inset_0_1px_0_oklch(1_0_0_/_0.08)]"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                )}
              >
                {active ? (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gold shadow-[0_0_12px_oklch(0.84_0.14_85)]" aria-hidden />
                ) : null}

                <item.icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="space-y-1 pt-2 border-t border-sidebar-border/50">
          <p className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
            System
          </p>
          {secondaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium tracking-wide transition-all duration-200",
                  active
                    ? "bg-teal/10 text-teal"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="m-3 rounded-xl border border-teal/20 bg-gradient-to-b from-teal/5 to-transparent p-3 space-y-1 hairline">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-teal animate-pulse" />
          <p className="text-[10px] font-bold tracking-wider text-teal uppercase">
            Live Radar Active
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Connected to Amazon, Flipkart & Myntra live scrapers.
        </p>
      </div>
    </div>
  )
}
