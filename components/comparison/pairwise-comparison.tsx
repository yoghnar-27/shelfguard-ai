"use client"

import { Sparkles } from "lucide-react"
import type { MarketplaceProduct } from "@/lib/intelligence/types"
import { formatMoney } from "@/lib/format"
import { Card } from "@/components/ui/card"

function PairwiseRow({
  m1Name,
  m1Offer,
  m2Name,
  m2Offer,
}: {
  m1Name: string
  m1Offer: MarketplaceProduct
  m2Name: string
  m2Offer: MarketplaceProduct
}) {
  const m1Valid = m1Offer.isLive && m1Offer.price > 0
  const m2Valid = m2Offer.isLive && m2Offer.price > 0

  if (!m1Valid || !m2Valid) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-muted-foreground uppercase">
          <span>{m1Name}</span>
          <span>VS</span>
          <span>{m2Name}</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium">
          WAITING FOR ANOTHER LIVE MARKETPLACE
        </p>
      </div>
    )
  }

  const p1 = m1Offer.price
  const p2 = m2Offer.price
  const diff = Math.abs(p1 - p2)

  let resultLabel = ""
  if (p1 === p2) {
    resultLabel = `EQUAL PRICING — ${formatMoney(p1)} on both marketplaces`
  } else if (p1 < p2) {
    resultLabel = `${m1Name} is ${formatMoney(diff)} cheaper`
  } else {
    resultLabel = `${m2Name} is ${formatMoney(diff)} cheaper`
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/90 p-4 space-y-3 shadow-md hairline">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
        {/* Marketplace 1 */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-foreground uppercase">{m1Name}</span>
          <span className="font-mono text-base font-bold text-gold">{formatMoney(p1)}</span>
        </div>

        {/* VS Divider */}
        <span className="font-mono text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full border border-border/60 bg-muted/40 uppercase">
          VS
        </span>

        {/* Marketplace 2 */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-foreground uppercase">{m2Name}</span>
          <span className="font-mono text-base font-bold text-gold">{formatMoney(p2)}</span>
        </div>
      </div>

      {/* Difference / Equal Pricing Label */}
      <div className="flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/10 p-2.5 text-xs text-teal font-medium">
        <Sparkles className="size-4 shrink-0 text-teal" />
        <span className="font-bold">{resultLabel}</span>
      </div>
    </div>
  )
}

export function PairwiseComparison({
  amazonOffer,
  flipkartOffer,
  myntraOffer,
}: {
  amazonOffer: MarketplaceProduct
  flipkartOffer: MarketplaceProduct
  myntraOffer: MarketplaceProduct
}) {
  const liveOffers = [amazonOffer, flipkartOffer, myntraOffer].filter(
    (o) => o && o.isLive && o.price > 0
  )

  if (liveOffers.length < 2) {
    return (
      <Card className="p-6 border-border/80 bg-card/90 text-center space-y-2 hairline">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Market Comparison
        </span>
        <h4 className="font-heading text-lg font-bold text-foreground uppercase">
          WAITING FOR ANOTHER LIVE MARKETPLACE
        </h4>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          At least two live marketplace listings with valid prices are required to display pairwise comparisons.
        </p>
      </Card>
    )
  }

  // Calculate overall Best Price or Equal Pricing
  const lowestPrice = Math.min(...liveOffers.map((o) => o.price))
  const highestPrice = Math.max(...liveOffers.map((o) => o.price))
  const isEqualAll = liveOffers.length >= 2 && lowestPrice === highestPrice
  const cheapestOffer = liveOffers.find((o) => o.price === lowestPrice)

  return (
    <div className="space-y-4">
      {/* Overall Best Price / Equal Pricing Highlight Banner */}
      <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 via-card to-card p-5 shadow-xl hairline space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-gold" />
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
            {isEqualAll ? "EQUAL PRICING DETECTED" : "BEST PRICE OVERALL"}
          </span>
        </div>

        {isEqualAll ? (
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              EQUAL PRICING — {formatMoney(lowestPrice)} ACROSS {liveOffers.length === 3 ? "ALL 3 MARKETPLACES" : "BOTH MARKETPLACES"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatMoney(lowestPrice)} on {liveOffers.map((o) => o.marketplace.toUpperCase()).join(" • ")}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              BEST PRICE: <span className="text-gold uppercase">{cheapestOffer?.marketplace}</span> — {formatMoney(lowestPrice)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Lowest active offer verified across live retail scans.
            </p>
          </div>
        )}
      </div>

      {/* Pairwise Comparisons Stack */}
      <div className="space-y-3">
        <PairwiseRow
          m1Name="Amazon"
          m1Offer={amazonOffer}
          m2Name="Flipkart"
          m2Offer={flipkartOffer}
        />

        <PairwiseRow
          m1Name="Flipkart"
          m1Offer={flipkartOffer}
          m2Name="Myntra"
          m2Offer={myntraOffer}
        />
      </div>
    </div>
  )
}
