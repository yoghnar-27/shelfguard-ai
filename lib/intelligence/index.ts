import type { Product } from "@/lib/mock/types"
import { compareMarketplacePrices, compareStockStatus } from "./comparison"
import { detectOpportunities } from "./opportunities"
import { normalizeShelfGuardProduct } from "./normalizer"
import type { CompetitiveComparison, MarketplaceProduct } from "./types"

export * from "./types"
export * from "./normalizer"
export * from "./comparison"
export * from "./opportunities"

/**
 * Generates a complete CompetitiveComparison object for a product.
 * Amazon offer is set to LIVE when live Bright Data data is present.
 * Flipkart, Myntra, AJIO, and Nykaa offers are structured with demo data and explicitly labeled isLive: false.
 */
export function generateCompetitiveIntelligence(
  product: Product,
  liveProduct?: Product | null
): CompetitiveComparison {
  const isAmazonLive = Boolean(liveProduct && (liveProduct.id === product.id || liveProduct.id.startsWith("p-live-")))
  const baseAmazon = liveProduct || product

  const amazonOffer: MarketplaceProduct = normalizeShelfGuardProduct(baseAmazon, isAmazonLive)

  const flipkartOffer: MarketplaceProduct = {
    marketplace: "flipkart",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `FSN-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 0.94),
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

  const ajioOffer: MarketplaceProduct = {
    marketplace: "ajio",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `AJIO-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 0.96),
    originalPrice: baseAmazon.previousPrice || baseAmazon.currentPrice,
    currency: "INR",
    stockStatus: "in_stock",
    rating: 4.3,
    reviewCount: 112,
    imageUrl: null,
    productUrl: "https://www.ajio.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  }

  const nykaaOffer: MarketplaceProduct = {
    marketplace: "nykaa",
    productName: baseAmazon.name,
    brand: baseAmazon.competitor,
    productId: `NYK-${baseAmazon.sku.replaceAll(/\s+/g, "")}`,
    price: Math.round(baseAmazon.currentPrice * 0.98),
    originalPrice: baseAmazon.previousPrice || baseAmazon.currentPrice,
    currency: "INR",
    stockStatus: "in_stock",
    rating: 4.4,
    reviewCount: 95,
    imageUrl: null,
    productUrl: "https://www.nykaa.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  }

  const offers: MarketplaceProduct[] = [
    amazonOffer,
    flipkartOffer,
    myntraOffer,
    ajioOffer,
    nykaaOffer,
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
