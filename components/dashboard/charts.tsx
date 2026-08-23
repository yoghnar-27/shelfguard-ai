"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatMoney } from "@/lib/format"
import type { PricePoint } from "@/lib/mock/types"

function ChartFrame({ children, height }: { children: ReactNode; height: number }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])
  if (!ready) {
    return <div style={{ height }} className="w-full min-w-0 rounded-lg bg-muted/20 animate-pulse" />
  }
  return (
    <div style={{ height }} className="w-full min-w-0">
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 p-3 text-xs shadow-xl backdrop-blur-md">
      <p className="font-semibold text-foreground">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-medium tabular-nums text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PriceAreaChart({
  data,
  height = 240,
}: {
  data: PricePoint[]
  height?: number
}) {
  return (
    <ChartFrame height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.84 0.14 85)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.84 0.14 85)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "oklch(0.68 0.02 250)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₹${v}`}
            width={52}
            tick={{ fill: "oklch(0.68 0.02 250)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "oklch(0.84 0.14 85 / 0.4)", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "oklch(0.16 0.016 260 / 0.95)",
              border: "1px solid oklch(0.94 0.02 85 / 0.15)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
            }}
            formatter={(value) => [formatMoney(Number(value)), "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="oklch(0.84 0.14 85)"
            strokeWidth={2.5}
            fill="url(#priceFill)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function MovementChart({
  data,
}: {
  data: Array<{ day: string; drops: number; increases: number; stockouts: number }>
}) {
  return (
    <ChartFrame height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fill: "oklch(0.68 0.02 250)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "oklch(0.68 0.02 250)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, fontSize: 11, color: "oklch(0.68 0.02 250)" }}
          />
          <Bar dataKey="drops" name="Price Drops" fill="oklch(0.78 0.11 185)" radius={[4, 4, 0, 0]} animationDuration={800} />
          <Bar dataKey="increases" name="Price Increases" fill="oklch(0.84 0.14 85)" radius={[4, 4, 0, 0]} animationDuration={800} />
          <Bar dataKey="stockouts" name="Stockouts" fill="oklch(0.68 0.18 25)" radius={[4, 4, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

