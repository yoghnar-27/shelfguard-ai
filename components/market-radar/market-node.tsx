"use client"

import { useState } from "react"
import { LiveIndicator } from "@/components/shared/live-indicator"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export type MarketNodeData = {
  id: string
  name: string
  price?: number
  isLive: boolean
  stockStatus?: string
  xPct: number // % position on radar canvas
  yPct: number
}

export function MarketNode({ node }: { node: MarketNodeData }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20"
      style={{ left: `${node.xPct}%`, top: `${node.yPct}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Radial pulse ring */}
      {node.isLive ? (
        <span className="absolute -inset-3 rounded-full bg-teal/20 animate-ping opacity-40" />
      ) : null}

      {/* Main Node button */}
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md shadow-lg transition-all duration-300 cursor-pointer",
          node.isLive
            ? "border-teal/50 bg-card/90 text-foreground hover:border-teal hover:scale-110 hover:shadow-teal/20"
            : "border-border/60 bg-card/50 text-muted-foreground opacity-65 hover:opacity-100"
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full",
            node.isLive ? "bg-teal animate-pulse" : "bg-muted-foreground/60"
          )}
        />
        <span className="font-heading text-xs font-bold capitalize">{node.name}</span>
        {node.isLive && node.price ? (
          <span className="font-mono text-xs font-semibold text-teal">{formatMoney(node.price)}</span>
        ) : null}
      </div>

      {/* Floating Tooltip on Hover */}
      {hovered ? (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl border border-teal/40 bg-card/95 p-3 shadow-2xl backdrop-blur-xl z-50 space-y-1.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-foreground capitalize">{node.name}</span>
            <LiveIndicator isLive={node.isLive} className="px-1.5 py-0 text-[9px]" />
          </div>
          <div className="flex items-baseline justify-between border-t border-border/50 pt-1">
            <span className="text-[10px] text-muted-foreground uppercase">Price</span>
            <span className="font-mono text-sm font-bold text-teal">
              {node.isLive && node.price ? formatMoney(node.price) : "Unavailable"}

            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Availability</span>
            <span className={cn("font-semibold capitalize", node.isLive ? "text-teal" : "text-muted-foreground")}>
              {node.isLive ? node.stockStatus || "In Stock" : "Not Connected"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
