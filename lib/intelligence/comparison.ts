import type {
  MarketplaceProduct,
  PriceComparisonSummary,
  StockComparisonSummary,
  SupportedMarketplace,
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
 * Pure function: Compares prices across a set of marketplace product offers.
 */
export function compareMarketplacePrices(offers: MarketplaceProduct[]): PriceComparisonSummary {
  if (!offers.length) {
    return {
      lowestPrice: 0,
      highestPrice: 0,
      priceSpread: 0,
      priceSpreadPercentage: 0,
      cheapestMarketplace: "amazon",
      mostExpensiveMarketplace: "amazon",
    }
  }

  let lowestOffer = offers[0]
  let highestOffer = offers[0]

  for (const offer of offers) {
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
 * Pure function: Evaluates inventory availability across marketplaces.
 */
export function compareStockStatus(offers: MarketplaceProduct[]): StockComparisonSummary {
  let inStockCount = 0
  let outOfStockCount = 0
  const outOfStockMarketplaces: SupportedMarketplace[] = []

  for (const offer of offers) {
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
