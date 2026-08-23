"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Box,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  Shield,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { workspace } from "@/lib/mock"

const nav = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist", icon: ListChecks },
  { href: "/products", label: "Products", icon: Box },
  { href: "/opportunities", label: "Opportunities", icon: Sparkles },
  { href: "/health", label: "Scraper Health", icon: HeartPulse },
  { href: "/activity", label: "Activity", icon: Activity },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border/60">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gold text-gold-foreground shadow-[0_0_24px_oklch(0.84_0.14_85_/_0.3)] transition-transform hover:scale-105">
          <Shield className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold tracking-tight text-foreground">ShelfGuard AI</p>
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            {workspace.name}
          </p>
        </div>
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {nav.map((item) => {
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
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gold shadow-[0_0_10px_oklch(0.84_0.14_85_/_0.8)]" aria-hidden />
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
      </nav>

      <div className="m-3 rounded-xl border border-gold/20 bg-gradient-to-b from-gold/5 to-transparent p-3.5 space-y-1.5 hairline">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-gold animate-pulse" />
          <p className="text-[10px] font-bold tracking-wider text-gold uppercase">
            Simulation Mode
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Marketplace changes monitored continuously.
        </p>
      </div>
    </div>
  )
}

