import type {
  DetectedOpportunitySignal,
  MarketplaceProduct,
  PriceComparisonSummary,
  StockComparisonSummary,
} from "./types"

/**
 * Pure function: Detects opportunity signals by running competitive rules against offer comparisons.
 */
export function detectOpportunities(
  offers: MarketplaceProduct[],
  priceSummary: PriceComparisonSummary,
  stockSummary: StockComparisonSummary
): DetectedOpportunitySignal[] {
  const signals: DetectedOpportunitySignal[] = []
  const now = new Date().toISOString()

  if (!offers.length) return signals

  // Rule 1: PRICE_UNDERCUT
  // Triggers if there is a price spread where the cheapest offer undercuts the highest offer by > 2%
  if (priceSummary.priceSpreadPercentage > 2) {
    const cheapestOffer = offers.find((o) => o.marketplace === priceSummary.cheapestMarketplace)
    const highestOffer = offers.find((o) => o.marketplace === priceSummary.mostExpensiveMarketplace)

    if (cheapestOffer && highestOffer) {
      signals.push({
        id: `opp-undercut-${cheapestOffer.marketplace}-${Date.now()}`,
        rule: "PRICE_UNDERCUT",
        severity: priceSummary.priceSpreadPercentage > 10 ? "high" : "medium",
        title: `${cheapestOffer.marketplace.toUpperCase()} Undercutting by ${priceSummary.priceSpreadPercentage}%`,
        description: `${cheapestOffer.marketplace.toUpperCase()} is offering ₹${cheapestOffer.price.toLocaleString()} vs ₹${highestOffer.price.toLocaleString()} on ${highestOffer.marketplace.toUpperCase()}.`,
        evidence: `Price gap of ₹${priceSummary.priceSpread.toLocaleString()} (${priceSummary.priceSpreadPercentage}%) detected across channels.`,
        recommendedAction: `Adjust listing price on ${highestOffer.marketplace.toUpperCase()} to maintain buy-box competitiveness.`,
        impact: `Reclaim up to 18% lost conversions from ${cheapestOffer.marketplace.toUpperCase()}.`,
        score: Math.min(95, Math.round(70 + priceSummary.priceSpreadPercentage)),
        marketplace: cheapestOffer.marketplace,
        detectedAt: now,
        isLive: cheapestOffer.isLive,
      })
    }
  }

  // Rule 2: PRICE_GAP
  // Triggers if price variance across channels exceeds 15%
  if (priceSummary.priceSpreadPercentage >= 15) {
    signals.push({
      id: `opp-gap-${Date.now()}`,
      rule: "PRICE_GAP",
      severity: "critical",
      title: `Critical Price Variance (${priceSummary.priceSpreadPercentage}% Gap)`,
      description: `Wide price divergence detected between ${priceSummary.cheapestMarketplace.toUpperCase()} and ${priceSummary.mostExpensiveMarketplace.toUpperCase()}.`,
      evidence: `Spread: ₹${priceSummary.lowestPrice.toLocaleString()} to ₹${priceSummary.highestPrice.toLocaleString()}`,
      recommendedAction: `Audit MAP (Minimum Advertised Price) enforcement across all distribution partners.`,
      impact: `Protect brand equity and prevent seller arbitrage across marketplaces.`,
      score: 92,
      marketplace: priceSummary.cheapestMarketplace,
      detectedAt: now,
      isLive: offers.some((o) => o.isLive),
    })
  }

  // Rule 3: STOCKOUT_OPPORTUNITY
  // Triggers when at least one marketplace is out of stock while others have stock
  if (stockSummary.outOfStockCount > 0 && stockSummary.inStockCount > 0) {
    const outMarketplace = stockSummary.outOfStockMarketplaces[0]
    signals.push({
      id: `opp-stockout-${outMarketplace}-${Date.now()}`,
      rule: "STOCKOUT_OPPORTUNITY",
      severity: "high",
      title: `Stockout Disruption on ${outMarketplace.toUpperCase()}`,
      description: `Primary competitor PDP on ${outMarketplace.toUpperCase()} is out of stock while secondary channels remain available.`,
      evidence: `Stockout confirmed on ${outMarketplace.toUpperCase()}.`,
      recommendedAction: `Increase ad spend and boost search visibility on remaining active marketplaces to capture displaced demand.`,
      impact: `Capture up to +24% incremental sales during competitor stock outage.`,
      score: 88,
      marketplace: outMarketplace,
      detectedAt: now,
      isLive: offers.some((o) => o.marketplace === outMarketplace && o.isLive),
    })
  }

  // Rule 4: PRICE_DROP
  // Triggers when an offer has a significant discount vs original price (> 5%)
  for (const offer of offers) {
    if (offer.originalPrice > offer.price) {
      const discountPct = Number(
        (((offer.originalPrice - offer.price) / offer.originalPrice) * 100).toFixed(1)
      )
      if (discountPct >= 5) {
        signals.push({
          id: `opp-drop-${offer.marketplace}-${Date.now()}`,
          rule: "PRICE_DROP",
          severity: discountPct >= 20 ? "high" : "medium",
          title: `Material Price Drop on ${offer.marketplace.toUpperCase()} (-${discountPct}%)`,
          description: `Price dropped from ₹${offer.originalPrice.toLocaleString()} to ₹${offer.price.toLocaleString()} on ${offer.marketplace.toUpperCase()}.`,
          evidence: `Discount of ${discountPct}% verified on PDP.`,
          recommendedAction: `Evaluate margin thresholds and match promotional pricing if volume demands.`,
          impact: `Prevent traffic attrition to discounted ${offer.marketplace.toUpperCase()} listing.`,
          score: Math.min(90, Math.round(60 + discountPct)),
          marketplace: offer.marketplace,
          detectedAt: now,
          isLive: offer.isLive,
        })
      }
    }
  }

  // Rule 5: LOW_STOCK
  for (const offer of offers) {
    if (offer.stockStatus === "low_stock") {
      signals.push({
        id: `opp-lowstock-${offer.marketplace}-${Date.now()}`,
        rule: "LOW_STOCK",
        severity: "medium",
        title: `Low Stock Warning on ${offer.marketplace.toUpperCase()}`,
        description: `Inventory level critically low on ${offer.marketplace.toUpperCase()}.`,
        evidence: `PDP stock status indicates low inventory.`,
        recommendedAction: `Prepare replenishment shipment or activate contingency ad budget on alternate channels.`,
        impact: `Prevent complete stockout penalty in channel search rankings.`,
        score: 74,
        marketplace: offer.marketplace,
        detectedAt: now,
        isLive: offer.isLive,
      })
    }
  }

  return signals
}
