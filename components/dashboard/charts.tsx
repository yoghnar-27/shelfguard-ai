"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
    return <div style={{ height }} className="w-full min-w-0 rounded-lg bg-muted/20" />
  }
  return (
    <div style={{ height }} className="w-full min-w-0">
      {children}
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
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.84 0.13 85)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="oklch(0.84 0.13 85)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "oklch(0.72 0.02 80)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            width={40}
            tick={{ fill: "oklch(0.72 0.02 80)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "oklch(0.84 0.13 85 / 0.4)" }}
            contentStyle={{
              background: "oklch(0.185 0.014 70)",
              border: "1px solid oklch(0.94 0.02 85 / 0.12)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value) => [formatMoney(Number(value)), "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="oklch(0.84 0.13 85)"
            strokeWidth={2}
            fill="url(#priceFill)"
            animationDuration={700}
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
    <ChartFrame height={224}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "oklch(0.72 0.02 80)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "oklch(0.72 0.02 80)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.185 0.014 70)",
              border: "1px solid oklch(0.94 0.02 85 / 0.12)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey="drops" name="Price drops" fill="oklch(0.8 0.1 185)" radius={4} />
          <Bar dataKey="increases" name="Price increases" fill="oklch(0.84 0.13 85)" radius={4} />
          <Bar dataKey="stockouts" name="Stockouts" fill="oklch(0.72 0.17 25)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
