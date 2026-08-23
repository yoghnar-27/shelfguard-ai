"use client"

import type { MarketNodeData } from "./market-node"
import { MarketNode } from "./market-node"

export function MarketRadar({
  amazonPrice = 0,
  flipkartPrice = 0,
  myntraPrice = 0,
  isAmazonLive = false,
  isFlipkartLive = false,
  isMyntraLive = false,
}: {
  amazonPrice?: number
  flipkartPrice?: number
  myntraPrice?: number
  isAmazonLive?: boolean
  isFlipkartLive?: boolean
  isMyntraLive?: boolean
}) {
  const nodes: MarketNodeData[] = [
    {
      id: "amazon",
      name: "Amazon",
      price: amazonPrice,
      isLive: isAmazonLive,
      stockStatus: isAmazonLive ? "In Stock" : "Unavailable",
      xPct: 28,
      yPct: 35,
    },
    {
      id: "flipkart",
      name: "Flipkart",
      price: flipkartPrice,
      isLive: isFlipkartLive,
      stockStatus: isFlipkartLive ? "In Stock" : "Unavailable",
      xPct: 72,
      yPct: 35,
    },
    {
      id: "myntra",
      name: "Myntra",
      price: myntraPrice,
      isLive: isMyntraLive,
      stockStatus: isMyntraLive ? "In Stock" : "Unavailable",
      xPct: 50,
      yPct: 75,
    },
  ]

  return (
    <div className="relative aspect-square w-full max-w-[420px] mx-auto overflow-hidden rounded-full border border-teal/20 bg-[#0a0d12]/90 p-4 shadow-2xl hairline">
      {/* Concentric radar rings */}
      <div className="absolute inset-4 rounded-full border border-teal/15 pointer-events-none" />
      <div className="absolute inset-16 rounded-full border border-teal/20 pointer-events-none" />
      <div className="absolute inset-28 rounded-full border border-teal/25 pointer-events-none" />
      <div className="absolute inset-40 rounded-full border border-teal/30 pointer-events-none" />

      {/* Axis crosshair lines */}
      <div className="absolute top-1/2 left-4 right-4 h-px bg-teal/10 pointer-events-none" />
      <div className="absolute left-1/2 top-4 bottom-4 w-px bg-teal/10 pointer-events-none" />

      {/* Rotating Radar Beam SVG Sweep */}
      <div className="absolute inset-0 animate-spin pointer-events-none" style={{ animationDuration: "12s" }}>
        <svg viewBox="0 0 100 100" className="size-full">
          <defs>
            <radialGradient id="radar-sweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M50 50 L50 0 A50 50 0 0 1 100 50 Z" fill="url(#radar-sweep)" />
        </svg>
      </div>

      {/* Connection arcs between live marketplaces */}
      {isAmazonLive && isFlipkartLive ? (
        <svg className="absolute inset-0 size-full pointer-events-none z-10" viewBox="0 0 100 100">
          <line
            x1="28"
            y1="35"
            x2="72"
            y2="35"
            stroke="#00f2fe"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            className="animate-pulse"
          />
        </svg>
      ) : null}

      {/* Marketplace Nodes */}
      {nodes.map((node) => (
        <MarketNode key={node.id} node={node} />
      ))}

      {/* Center Radar Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border border-teal bg-teal/20 backdrop-blur-md flex items-center justify-center pointer-events-none z-10">
        <span className="size-1.5 rounded-full bg-teal animate-ping" />
      </div>
    </div>
  )
}
