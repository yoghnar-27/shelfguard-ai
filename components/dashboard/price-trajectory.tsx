"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"

const trajectoryData = [
  { time: "18 Aug", Amazon: 4499, Flipkart: 8990 },
  { time: "19 Aug", Amazon: 4299, Flipkart: 8990 },
  { time: "20 Aug", Amazon: 4199, Flipkart: 8990 },
  { time: "21 Aug", Amazon: 3999, Flipkart: 8990 },
  { time: "22 Aug", Amazon: 3999, Flipkart: 8990 },
  { time: "Today", Amazon: 3999, Flipkart: 8990 },
]

export function PriceTrajectory({
  amazonCurrent = 3999,
  flipkartCurrent = 8990,
}: {
  amazonCurrent?: number
  flipkartCurrent?: number
}) {
  const chartData = trajectoryData.map((item, idx) => {
    if (idx === trajectoryData.length - 1) {
      return {
        ...item,
        Amazon: amazonCurrent || item.Amazon,
        Flipkart: flipkartCurrent || item.Flipkart,
      }
    }
    return item
  })

  return (
    <Card className="hairline border-border/80 bg-card/90">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg font-bold">PRICE TRAJECTORY</CardTitle>
            <CardDescription className="text-xs">
              Historical channel position over recent scanning windows.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-teal">
              <span className="size-2 rounded-full bg-teal" /> Amazon
            </span>
            <span className="flex items-center gap-1.5 text-gold">
              <span className="size-2 rounded-full bg-gold" /> Flipkart
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="amazonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flipkartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-xl border border-teal/40 bg-card/95 p-3 text-xs shadow-2xl backdrop-blur-md space-y-1">
                      <p className="font-bold text-foreground">{label}</p>
                      {payload.map((p) => (
                        <p key={p.name} className="font-mono text-xs flex items-center justify-between gap-3">
                          <span style={{ color: p.color }}>{p.name}:</span>
                          <span className="font-bold text-foreground">{formatMoney(Number(p.value))}</span>
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="Amazon"
                stroke="#00f2fe"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#amazonGrad)"
              />
              <Area
                type="monotone"
                dataKey="Flipkart"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#flipkartGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
