"use client"

import { useEffect, useState } from "react"
import { ArrowLeftRight, Boxes, HeartPulse, Sparkles, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const icons = {
  boxes: Boxes,
  pulse: HeartPulse,
  spark: Sparkles,
  delta: ArrowLeftRight,
} as const

const trends = {
  boxes: { label: "+4 this week", positive: true },
  delta: { label: "+2 material", positive: true },
  spark: { label: "1 high priority", positive: false },
  pulse: { label: "+0.4% stability", positive: true },
} as const

const sparklines = {
  boxes: [40, 55, 65, 70, 85, 92, 100],
  delta: [20, 35, 45, 30, 60, 75, 88],
  spark: [10, 25, 40, 60, 50, 70, 95],
  pulse: [95, 96, 97, 98, 98, 99, 99.2],
} as const

function useCountUp(target: number, duration = 750) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

function MiniSparkline({ data, tone }: { data: number[]; tone: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 54
      const y = 18 - ((val - min) / range) * 14
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width="56" height="20" className="overflow-visible" aria-hidden>
      <polyline
        fill="none"
        stroke={
          tone === "gold"
            ? "oklch(0.84 0.14 85)"
            : tone === "teal"
            ? "oklch(0.78 0.11 185)"
            : tone === "signal"
            ? "oklch(0.68 0.18 25)"
            : "oklch(0.68 0.02 250)"
        }
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function KpiCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  hint,
  icon,
  tone = "default",
}: {
  label: string
  value: number
  suffix?: string
  decimals?: number
  hint: string
  icon: keyof typeof icons
  tone?: "default" | "gold" | "teal" | "signal"
}) {
  const animated = useCountUp(value)
  const display = animated.toFixed(decimals)
  const Icon = icons[icon]
  const trend = trends[icon]
  const sparkData = sparklines[icon]

  return (
    <Card
      size="sm"
      className={cn(
        "group relative overflow-hidden transition-all duration-300 card-hover hairline h-full hover:-translate-y-1 hover:border-gold/30 hover:bg-gradient-to-b hover:from-card hover:to-accent/20 hover:shadow-xl",
        tone === "gold" && "hover:border-gold/40",
        tone === "teal" && "hover:border-teal/40",
        tone === "signal" && "hover:border-signal/40"
      )}
      title={hint}
    >
      {/* Top subtle highlight line */}
      <div
        className={cn(
          "absolute top-0 inset-x-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          tone === "gold" && "bg-gold",
          tone === "teal" && "bg-teal",
          tone === "signal" && "bg-signal",
          tone === "default" && "bg-muted-foreground"
        )}
        aria-hidden
      />

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110",
              tone === "gold" && "border-gold/30 bg-gold/10 text-gold shadow-[0_0_12px_oklch(0.84_0.14_85_/_0.2)]",
              tone === "teal" && "border-teal/30 bg-teal/10 text-teal shadow-[0_0_12px_oklch(0.78_0.11_185_/_0.2)]",
              tone === "signal" && "border-signal/30 bg-signal/10 text-signal shadow-[0_0_12px_oklch(0.68_0.18_25_/_0.2)]",
              tone === "default" && "border-border/80 bg-muted/40 text-muted-foreground"
            )}
            aria-hidden
          >
            <Icon className="size-4" />
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="font-heading text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {display}
              {suffix ? <span className="text-xl font-medium text-muted-foreground">{suffix}</span> : null}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px]",
                  trend.positive ? "text-teal" : "text-signal"
                )}
              >
                <TrendingUp className="size-3" />
                {trend.label}
              </span>
            </div>
          </div>

          <div className="pb-1 opacity-80 transition-opacity group-hover:opacity-100">
            <MiniSparkline data={[...sparkData]} tone={tone} />
          </div>
        </div>

        <p className="sr-only">{hint}</p>
      </CardContent>
    </Card>
  )
}

