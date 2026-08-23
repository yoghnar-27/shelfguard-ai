"use client"

import { AnimatedNumber } from "@/components/shared/animated-number"
import { LiveIndicator } from "@/components/shared/live-indicator"
import { TiltCard } from "@/components/shared/tilt-card"
import { StockPill } from "@/components/dashboard/status-pills"
import type { StockStatus } from "@/lib/mock/types"
import { cn } from "@/lib/utils"

export function MarketplacePriceCard({
  marketplace,
  price,
  originalPrice,
  stockStatus = "in_stock",
  isLive = true,
  hasUrl = true,
  isCheapest = false,
}: {
  marketplace: string
  price: number
  originalPrice?: number
  stockStatus?: StockStatus
  isLive?: boolean
  hasUrl?: boolean
  isCheapest?: boolean
}) {
  const isValidLive = isLive && price > 0

  return (
    <TiltCard className="h-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 shadow-xl transition-all duration-300 h-full flex flex-col justify-between",
          isCheapest && isValidLive
            ? "border-gold/50 bg-gradient-to-b from-gold/10 via-card to-card shadow-gold/10"
            : "border-border/80 bg-card/90 hover:border-gold/30"
        )}
      >
        {isCheapest && isValidLive ? (
          <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-gold/15 blur-2xl" />
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground uppercase">
              {marketplace}
            </span>
            <LiveIndicator isLive={isValidLive} hasUrl={hasUrl} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Current Market Price
            </p>
            {isValidLive ? (
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={price}
                  className={cn(
                    "font-mono text-3xl font-bold tracking-tight tabular-nums",
                    isCheapest ? "text-gold" : "text-foreground"
                  )}
                />
                {originalPrice && originalPrice > price ? (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="py-1">
                <span className="font-mono text-lg font-bold text-muted-foreground">
                  {hasUrl ? "Unable to Retrieve" : "Not Provided"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-6">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Availability
          </span>
          {isValidLive ? (
            <StockPill status={stockStatus} />
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {hasUrl ? "UNABLE TO RETRIEVE" : "NOT PROVIDED"}
            </span>
          )}
        </div>
      </div>
    </TiltCard>
  )
}
