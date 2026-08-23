import type {
  MarketplaceProduct,
  PriceComparisonSummary,
  StockComparisonSummary,
} from "./types"

/**
 * Pure function: Calculates percentage difference between base and target price.
 */
export function calculatePercentageDifference(basePrice: number, targetPrice: number): number {
  if (basePrice <= 0) return 0
  const diff = targetPrice - basePrice
  return Number(((diff / basePrice) * 100).toFixed(1))
}

/**
 * Pure function: Compares prices strictly across LIVE marketplace product offers (isLive === true).
 * Excludes unconnected, errored, or non-live fallback offers.
 */
export function compareMarketplacePrices(offers: MarketplaceProduct[]): PriceComparisonSummary {
  const liveOffers = offers.filter((o) => o && o.isLive === true && o.price > 0)

  if (!liveOffers.length) {
    return {
      lowestPrice: 0,
      highestPrice: 0,
      priceSpread: 0,
      priceSpreadPercentage: 0,
      cheapestMarketplace: "amazon",
      mostExpensiveMarketplace: "amazon",
    }
  }

  let lowestOffer = liveOffers[0]
  let highestOffer = liveOffers[0]

  for (const offer of liveOffers) {
    if (offer.price < lowestOffer.price) {
      lowestOffer = offer
    }
    if (offer.price > highestOffer.price) {
      highestOffer = offer
    }
  }

  const lowestPrice = lowestOffer.price
  const highestPrice = highestOffer.price
  const priceSpread = highestPrice - lowestPrice
  const priceSpreadPercentage =
    lowestPrice > 0 ? Number(((priceSpread / lowestPrice) * 100).toFixed(1)) : 0

  return {
    lowestPrice,
    highestPrice,
    priceSpread,
    priceSpreadPercentage,
    cheapestMarketplace: lowestOffer.marketplace,
    mostExpensiveMarketplace: highestOffer.marketplace,
  }
}

/**
 * Pure function: Evaluates inventory availability strictly across LIVE marketplace offers.
 */
export function compareStockStatus(offers: MarketplaceProduct[]): StockComparisonSummary {
  const liveOffers = offers.filter((o) => o && o.isLive === true)

  let inStockCount = 0
  let outOfStockCount = 0
  const outOfStockMarketplaces: Array<MarketplaceProduct["marketplace"]> = []

  for (const offer of liveOffers) {
    if (offer.stockStatus === "out_of_stock") {
      outOfStockCount++
      outOfStockMarketplaces.push(offer.marketplace)
    } else {
      inStockCount++
    }
  }

  return {
    inStockCount,
    outOfStockCount,
    outOfStockMarketplaces,
  }
}
