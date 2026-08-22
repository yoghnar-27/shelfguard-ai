"use client"

import { useEffect, useState } from "react"
import { ArrowLeftRight, Boxes, HeartPulse, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const icons = {
  boxes: Boxes,
  pulse: HeartPulse,
  spark: Sparkles,
  delta: ArrowLeftRight,
} as const

function useCountUp(target: number, duration = 650) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setValue(target)
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

  return (
    <Card
      size="sm"
      className="card-hover hairline h-full hover:bg-muted/15"
      title={hint}
    >
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {label}
          </p>
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-md border",
              tone === "gold" && "border-gold/20 bg-gold/10 text-gold",
              tone === "teal" && "border-teal/20 bg-teal/10 text-teal",
              tone === "signal" && "border-signal/20 bg-signal/10 text-signal",
              tone === "default" && "border-border bg-muted/40 text-muted-foreground"
            )}
            aria-hidden
          >
            <Icon className="size-3.5" />
          </span>
        </div>
        <p className="mt-3 font-heading text-[1.75rem] leading-none tracking-tight tabular-nums">
          {display}
          {suffix ? <span className="text-xl">{suffix}</span> : null}
        </p>
        <p className="sr-only">{hint}</p>
      </CardContent>
    </Card>
  )
}
