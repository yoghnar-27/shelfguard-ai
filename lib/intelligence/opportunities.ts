import type {
  DetectedOpportunitySignal,
  MarketplaceProduct,
  PriceComparisonSummary,
  StockComparisonSummary,
} from "./types"

/**
 * Pure function: Detects opportunity signals strictly across LIVE marketplace product offers (isLive === true).
 * Non-live or fallback offers are completely ignored.
 * Evaluates 6 core rules dynamically across N active marketplaces (Amazon, Flipkart, Myntra, Meesho, Purplle).
 */
export function detectOpportunities(
  offers: MarketplaceProduct[],
  priceSummary: PriceComparisonSummary,
  stockSummary: StockComparisonSummary
): DetectedOpportunitySignal[] {
  const signals: DetectedOpportunitySignal[] = []
  const now = new Date().toISOString()

  const liveOffers = offers.filter((o) => o && o.isLive === true && o.price > 0)
  if (liveOffers.length < 2) return signals

  // Rule 1: PRICE_UNDERCUT across live offers
  if (priceSummary.priceSpreadPercentage > 2) {
    const cheapestOffer = liveOffers.find((o) => o.marketplace === priceSummary.cheapestMarketplace)
    const highestOffer = liveOffers.find((o) => o.marketplace === priceSummary.mostExpensiveMarketplace)

    if (cheapestOffer && highestOffer) {
      signals.push({
        id: `opp-undercut-${cheapestOffer.marketplace}-${Date.now()}`,
        rule: "PRICE_UNDERCUT",
        severity: priceSummary.priceSpreadPercentage > 10 ? "high" : "medium",
        title: `${cheapestOffer.marketplace.toUpperCase()} is ₹${priceSummary.priceSpread.toLocaleString()} cheaper than ${highestOffer.marketplace.toUpperCase()}`,
        description: `${cheapestOffer.marketplace.toUpperCase()} is listed at ₹${cheapestOffer.price.toLocaleString()} vs ₹${highestOffer.price.toLocaleString()} on ${highestOffer.marketplace.toUpperCase()}.`,
        evidence: `${priceSummary.priceSpreadPercentage}% price gap (${highestOffer.marketplace.toUpperCase()} ₹${highestOffer.price.toLocaleString()} → ${cheapestOffer.marketplace.toUpperCase()} ₹${cheapestOffer.price.toLocaleString()})`,
        recommendedAction: `Review pricing on ${highestOffer.marketplace.toUpperCase()} to protect buy-box share.`,
        impact: `Reclaim channel conversions on ${cheapestOffer.marketplace.toUpperCase()}.`,
        score: Math.min(95, Math.round(70 + priceSummary.priceSpreadPercentage)),
        marketplace: cheapestOffer.marketplace,
        detectedAt: now,
        isLive: true,
      })
    }
  }

  // Rule 2: PRICE_GAP (>15% divergence across live channels)
  if (priceSummary.priceSpreadPercentage >= 15) {
    signals.push({
      id: `opp-gap-${Date.now()}`,
      rule: "PRICE_GAP",
      severity: "critical",
      title: `${priceSummary.priceSpreadPercentage}% Price Gap Between Marketplaces`,
      description: `Material price divergence detected between ${priceSummary.cheapestMarketplace.toUpperCase()} and ${priceSummary.mostExpensiveMarketplace.toUpperCase()}.`,
      evidence: `Spread: ₹${priceSummary.lowestPrice.toLocaleString()} to ₹${priceSummary.highestPrice.toLocaleString()}`,
      recommendedAction: `Audit MAP (Minimum Advertised Price) compliance across distribution partners.`,
      impact: `Prevent cross-channel seller arbitrage and protect brand equity.`,
      score: 92,
      marketplace: priceSummary.cheapestMarketplace,
      detectedAt: now,
      isLive: true,
    })
  }

  // Rule 3: STOCKOUT_OPPORTUNITY (Live stockout vs live available)
  if (stockSummary.outOfStockCount > 0 && stockSummary.inStockCount > 0) {
    const outMarketplace = stockSummary.outOfStockMarketplaces[0]
    signals.push({
      id: `opp-stockout-${outMarketplace}-${Date.now()}`,
      rule: "STOCKOUT_OPPORTUNITY",
      severity: "high",
      title: `Competitor Stockout Detected on ${outMarketplace.toUpperCase()}`,
      description: `Primary listing on ${outMarketplace.toUpperCase()} is out of stock while other live channels remain available.`,
      evidence: `Confirmed stockout on ${outMarketplace.toUpperCase()}.`,
      recommendedAction: `Increase search visibility on active channels to capture displaced buyers.`,
      impact: `Capture demand during competitor stockout on ${outMarketplace.toUpperCase()}.`,
      score: 88,
      marketplace: outMarketplace,
      detectedAt: now,
      isLive: true,
    })
  }

  // Rule 4: PRICE_DROP on live offers
  for (const offer of liveOffers) {
    if (offer.originalPrice > offer.price) {
      const discountPct = Number(
        (((offer.originalPrice - offer.price) / offer.originalPrice) * 100).toFixed(1)
      )
      if (discountPct >= 5) {
        signals.push({
          id: `opp-drop-${offer.marketplace}-${Date.now()}`,
          rule: "PRICE_DROP",
          severity: discountPct >= 20 ? "high" : "medium",
          title: `Price Dropped ${discountPct}% on ${offer.marketplace.toUpperCase()}`,
          description: `Price moved from ₹${offer.originalPrice.toLocaleString()} to ₹${offer.price.toLocaleString()} on ${offer.marketplace.toUpperCase()}.`,
          evidence: `${discountPct}% price reduction active on PDP.`,
          recommendedAction: `Evaluate margin floors and consider promotional price match.`,
          impact: `Mitigate traffic loss to discounted ${offer.marketplace.toUpperCase()} listing.`,
          score: Math.min(90, Math.round(60 + discountPct)),
          marketplace: offer.marketplace,
          detectedAt: now,
          isLive: true,
        })
      }
    }
  }

  // Rule 5: LOW_STOCK warning
  for (const offer of liveOffers) {
    if (offer.stockStatus === "low_stock") {
      signals.push({
        id: `opp-lowstock-${offer.marketplace}-${Date.now()}`,
        rule: "LOW_STOCK",
        severity: "medium",
        title: `Low Stock Warning on ${offer.marketplace.toUpperCase()}`,
        description: `Inventory level is low for listing on ${offer.marketplace.toUpperCase()}.`,
        evidence: `Low stock status flagged on live PDP.`,
        recommendedAction: `Prepare replenishment shipments to prevent out-of-stock signal.`,
        impact: `Maintain Buy Box eligibility on ${offer.marketplace.toUpperCase()}.`,
        score: 75,
        marketplace: offer.marketplace,
        detectedAt: now,
        isLive: true,
      })
    }
  }

  // Rule 6: COMPETITIVE_MOVEMENT across 3+ channels
  if (liveOffers.length >= 3) {
    signals.push({
      id: `opp-movement-multi-${Date.now()}`,
      rule: "COMPETITIVE_MOVEMENT",
      severity: "info" as unknown as "low",
      title: `Multi-Marketplace Alignment Across ${liveOffers.length} Channels`,
      description: `Real-time pricing data synchronized across ${liveOffers.map((l) => l.marketplace.toUpperCase()).join(", ")}.`,
      evidence: `${liveOffers.length} active live channels tracked.`,
      recommendedAction: `Maintain automated price tracking across all active marketplaces.`,
      impact: `360-degree competitive marketplace visibility.`,
      score: 70,
      marketplace: priceSummary.cheapestMarketplace,
      detectedAt: now,
      isLive: true,
    })
  }

  return signals
}
