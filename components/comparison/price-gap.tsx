"use client"

import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

export function PriceGap({
  liveCount = 0,
  gapAmount,
  gapPercentage,
  cheapestMarketplace,
  equalPrice,
}: {
  liveCount?: number
  gapAmount: number
  gapPercentage: number
  cheapestMarketplace: string
  equalPrice?: number
}) {
  if (liveCount < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-1">
        <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          VS
        </span>
        <span className="text-[10px] text-muted-foreground font-medium leading-snug">
          Waiting for another live marketplace
        </span>
      </div>
    )
  }

  if (gapAmount <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold uppercase tracking-wider shadow-sm">
          <Sparkles className="size-3 text-gold" />
          EQUAL PRICING
        </span>
        <span className="text-xs font-mono font-bold text-foreground">
          ₹{equalPrice ? equalPrice.toLocaleString("en-IN") : "0"} across {liveCount === 3 ? "Amazon, Flipkart and Myntra" : `${liveCount} marketplaces`}
        </span>
      </div>
    )
  }

  const pointsToLeft = cheapestMarketplace.toLowerCase() === "amazon"

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/10 px-3 py-1 text-xs font-bold text-signal uppercase tracking-wider shadow-sm">
        <Sparkles className="size-3 text-signal" />
        ₹{gapAmount.toLocaleString("en-IN")} Price Gap
      </span>

      <div className="flex items-center gap-2 font-mono text-xs font-bold text-gold">
        {pointsToLeft ? <ArrowLeft className="size-4 animate-pulse text-gold" /> : null}
        <span>{gapPercentage}% Spread</span>
        {!pointsToLeft ? <ArrowRight className="size-4 animate-pulse text-gold" /> : null}
      </div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        {cheapestMarketplace.toUpperCase()} is cheaper
      </p>
    </div>
  )
}
