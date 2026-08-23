import Link from "next/link"
import {
  Activity,
  HeartPulse,
  PackageMinus,
  Sparkles,
  TriangleAlert,
  Wallet,
} from "lucide-react"
import { formatDateTime } from "@/lib/format"
import { activity } from "@/lib/mock"
import type { ActivityKind } from "@/lib/mock/types"
import { cn } from "@/lib/utils"

const icons: Record<ActivityKind, typeof Activity> = {
  price: Wallet,
  stock: PackageMinus,
  scraper_run: Activity,
  scraper_failure: TriangleAlert,
  healing: HeartPulse,
  opportunity: Sparkles,
}

const badgeStyles: Record<ActivityKind, string> = {
  price: "border-teal/30 bg-teal/10 text-teal",
  stock: "border-signal/30 bg-signal/10 text-signal",
  scraper_run: "border-border bg-muted/40 text-muted-foreground",
  scraper_failure: "border-signal/30 bg-signal/10 text-signal",
  healing: "border-gold/30 bg-gold/10 text-gold",
  opportunity: "border-gold/30 bg-gold/10 text-gold",
}

export function ActivityTimeline({ limit }: { limit?: number }) {
  const items = limit ? activity.slice(0, limit) : activity

  return (
    <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[1.25rem] before:w-px before:bg-gradient-to-b before:from-gold/50 before:via-border/60 before:to-transparent">
      {items.map((event, index) => {
        const Icon = icons[event.kind]
        const isLatest = index === 0

        const inner = (
          <div
            className={cn(
              "group relative flex items-start gap-3.5 rounded-xl border border-border/70 bg-card/60 p-3.5 transition-all duration-200 hover:border-gold/30 hover:bg-card hover:shadow-lg",
              isLatest && "border-teal/30 bg-teal/5"
            )}
          >
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-110",
                badgeStyles[event.kind]
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-foreground group-hover:text-gold transition-colors">
                  {event.title}
                </p>
                {isLatest ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-teal uppercase">
                    <span className="size-1.5 rounded-full bg-teal animate-pulse" />
                    LIVE
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{event.detail}</p>

              <div className="flex items-center gap-2 pt-0.5 text-[10px] text-muted-foreground">
                <span className="font-mono tabular-nums">{formatDateTime(event.at)}</span>
                <span>·</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[9px] font-medium tracking-wide uppercase",
                    badgeStyles[event.kind]
                  )}
                >
                  {event.kind.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        )

        if (!event.productId) {
          return (
            <li key={event.id} className="relative">
              {inner}
            </li>
          )
        }

        return (
          <li key={event.id} className="relative">
            <Link href={`/products/${event.productId}`} className="block">
              {inner}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

