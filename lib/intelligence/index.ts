import type { Product } from "@/lib/mock/types"
import { compareMarketplacePrices, compareStockStatus } from "./comparison"
import { detectOpportunities } from "./opportunities"
import type { CompetitiveComparison, MarketplaceProduct } from "./types"


export * from "./types"
export * from "./normalizer"
export * from "./comparison"
export * from "./opportunities"

/**
 * Generates a complete CompetitiveComparison object for a product.
 * Amazon offer is set to LIVE when live Bright Data data is present.
 * Flipkart, Myntra, Meesho, and Purplle offers are structured with demo data and explicitly labeled isLive: false.
 */
export function generateCompetitiveIntelligence(
  product: Product,
  liveProduct?: Product | null
): CompetitiveComparison {
  const isAmazonLive = Boolean(liveProduct && (liveProduct.id === product.id || liveProduct.id.startsWith("p-live-")))
  const baseAmazon = liveProduct || product

  const amazonOffer: MarketplaceProduct = normalizeShelfGuardProduct(baseAmazon, isAmazonLive)

  // Demo marketplace offers for other channels (explicitly labeled isLive: false)
  const flipkartOffer: MarketplaceProduct = {
    marketplace: "flipkart",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `FSN-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 0.94), // Demo 6% undercutting
    originalPrice: baseAmazon.previousPrice || baseAmazon.currentPrice,
    currency: "INR",
    stockStatus: "in_stock",
    rating: 4.4,
    reviewCount: 310,
    imageUrl: null,
    productUrl: "https://www.flipkart.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  }

  const myntraOffer: MarketplaceProduct = {
    marketplace: "myntra",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `MYN-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 1.02),
    originalPrice: baseAmazon.previousPrice || baseAmazon.currentPrice,
    currency: "INR",
    stockStatus: "in_stock",
    rating: 4.6,
    reviewCount: 85,
    imageUrl: null,
    productUrl: "https://www.myntra.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  }

  const meeshoOffer: MarketplaceProduct = {
    marketplace: "meesho",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `MEE-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 0.89),
    originalPrice: baseAmazon.previousPrice || baseAmazon.currentPrice,
    currency: "INR",
    stockStatus: "out_of_stock",
    rating: 4.1,
    reviewCount: 42,
    imageUrl: null,
    productUrl: "https://www.meesho.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  }

  const purplleOffer: MarketplaceProduct = {
    marketplace: "purplle",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `PUR-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 0.98),
    originalPrice: baseAmazon.previousPrice || baseAmazon.currentPrice,
    currency: "INR",
    stockStatus: "in_stock",
    rating: 4.3,
    reviewCount: 19,
    imageUrl: null,
    productUrl: "https://www.purplle.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  }

  const offers: MarketplaceProduct[] = [
    amazonOffer,
    flipkartOffer,
    myntraOffer,
    meeshoOffer,
    purplleOffer,
  ]

  const priceSummary = compareMarketplacePrices(offers)
  const stockSummary = compareStockStatus(offers)
  const opportunities = detectOpportunities(offers, priceSummary, stockSummary)

  return {
    productId: baseAmazon.id,
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    category: baseAmazon.category,
    offers,
    priceSummary,
    stockSummary,
    opportunities,
  }
}
