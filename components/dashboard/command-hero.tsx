"use client"

import type { ReactNode } from "react"
import { Activity, ShieldCheck, Zap } from "lucide-react"
import { kpis, workspace } from "@/lib/mock"

export function CommandHero({ actions }: { actions?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-b from-card via-card/90 to-background/80 p-6 shadow-2xl hairline">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-teal/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold tracking-wider text-teal uppercase">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-teal" />
              </span>
              Live Monitoring
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold uppercase">
              <Zap className="size-3 text-gold" aria-hidden />
              Demo Data / Simulation Mode
            </span>
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              ShelfGuard AI
            </h1>
            <p className="mt-1 text-sm font-medium tracking-wide text-muted-foreground uppercase sm:text-base">
              Competitive Intelligence Command Center
            </p>
          </div>

          <p className="max-w-2xl text-xs text-muted-foreground/90 sm:text-sm">
            Continuous marketplace extraction watching price moves, stockout events, and competitor shifts across India&apos;s leading e-commerce platforms.
          </p>
        </div>

        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
      </div>

      {/* Meta Indicators Grid */}
      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 sm:grid-cols-4">
        <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
          <Activity className="size-4 shrink-0 text-gold" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Last Synchronized
            </p>
            <p className="truncate text-xs font-medium tabular-nums text-foreground">
              {kpis.lastRunAgo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
          <ShieldCheck className="size-4 shrink-0 text-teal" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Collector Status
            </p>
            <p className="truncate text-xs font-medium tabular-nums text-teal">
              {kpis.scraperHealth}% Healthy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
          <span className="size-2 rounded-full bg-gold" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Tracked Retailers
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              Amazon · Flipkart · Myntra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
          <span className="size-2 rounded-full bg-teal" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Workspace
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {workspace.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
