import { cn } from "@/lib/utils"
import type { MonitorStatus, StockStatus } from "@/lib/mock/types"
import { stockLabel } from "@/lib/format"

export { ScoreRing, ScoreMeter } from "@/components/dashboard/score-ring"

export function StockPill({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        status === "in_stock" &&
          "border-teal/30 bg-teal/10 text-teal",
        status === "low_stock" &&
          "border-gold/30 bg-gold/10 text-gold",
        status === "out_of_stock" &&
          "border-signal/30 bg-signal/10 text-signal"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "in_stock" && "bg-teal",
          status === "low_stock" && "bg-gold",
          status === "out_of_stock" && "bg-signal"
        )}
        aria-hidden
      />
      {stockLabel(status)}
    </span>
  )
}

export function MonitorPill({ status }: { status: MonitorStatus }) {
  const label =
    status === "watching" ? "Watching" : status === "paused" ? "Paused" : "Healing"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        status === "watching" && "border-border bg-muted/50 text-foreground",
        status === "paused" && "border-border bg-transparent text-muted-foreground",
        status === "healing" && "border-gold/30 bg-gold/10 text-gold"
      )}
    >
      {label}
    </span>
  )
}

export function MonitorPill({ status }: { status: MonitorStatus }) {
