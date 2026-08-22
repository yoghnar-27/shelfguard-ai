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
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gold text-gold-foreground shadow-[0_0_24px_oklch(0.84_0.13_85_/_0.25)]">
          <Shield className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">ShelfGuard AI</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {workspace.name}
          </p>
        </div>
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 px-3">
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
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="m-3 rounded-xl border border-border/80 bg-muted/20 p-3">
        <p className="text-[11px] font-medium tracking-wide text-gold uppercase">
          Demo workspace
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Your competitors change. ShelfGuard notices.
        </p>
      </div>
    </div>
  )
}
