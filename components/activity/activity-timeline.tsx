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

export function ActivityTimeline({ limit }: { limit?: number }) {
  const items = limit ? activity.slice(0, limit) : activity
  return (
    <ol className="space-y-3">
      {items.map((event) => {
        const Icon = icons[event.kind]
        const inner = (
          <div className="flex gap-3 rounded-xl border border-border/70 bg-card/40 px-3 py-3 transition-colors hover:bg-card">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
              <Icon className="size-3.5 text-gold" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.detail}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatDateTime(event.at)}
                <span className="mx-1.5">·</span>
                <span className="capitalize">{event.kind.replace("_", " ")}</span>
              </p>
            </div>
          </div>
        )
        if (!event.productId) {
          return (
            <li key={event.id} className={cn("list-none")}>
              {inner}
            </li>
          )
        }
        return (
          <li key={event.id}>
            <Link href={`/products/${event.productId}`} className="block">
              {inner}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
