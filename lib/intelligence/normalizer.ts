import type { Product } from "@/lib/mock/types"
import type { MarketplaceProduct, SupportedMarketplace } from "./types"

/**
 * Normalizes raw payload data or custom marketplace fields into the unified MarketplaceProduct model.
 */
export function normalizeMarketplaceProduct(
  input: Record<string, unknown>,
  marketplace: SupportedMarketplace = "amazon",
  isLive = false
): MarketplaceProduct {
  const name =
    String(
      input.productName ||
        input.product_name ||
        input.title ||
        input.name ||
        "Marketplace Item"
    ).trim()

  const brand =
    String(
      input.brand ||
        input.seller ||
        input.brand_name ||
        input.competitor ||
        "Generic Brand"
    ).trim()

  const price = Number(input.price || input.currentPrice || input.current_price || 0)
  const originalPrice = Number(
    input.originalPrice || input.previousPrice || input.original_price || price
  )

  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
  const rawStock = String(input.stockStatus || input.stock_status || input.availability || "").toLowerCase()
  if (rawStock.includes("out") || rawStock === "false" || rawStock.includes("unavailable")) {
    stockStatus = "out_of_stock"
  } else if (rawStock.includes("low") || rawStock.includes("few")) {
    stockStatus = "low_stock"
  }

  return {
    marketplace,
    productName: name,
    brand,
    productId: String(input.productId || input.id || input.sku || input.asin || "unknown-id"),
    price,
    originalPrice,
    currency: String(input.currency || "INR"),
    stockStatus,
    rating: typeof input.rating === "number" ? input.rating : null,
    reviewCount: typeof input.reviewCount === "number" ? input.reviewCount : null,
    imageUrl: typeof input.imageUrl === "string" ? input.imageUrl : null,
    productUrl: String(input.productUrl || input.url || "#"),
    lastChecked: String(input.lastChecked || new Date().toISOString()),
    isLive,
  }
}

/**
 * Converts existing ShelfGuard Product domain model into the normalized MarketplaceProduct model.
 */
export function normalizeShelfGuardProduct(
  product: Product,
  isLive = false
): MarketplaceProduct {
  return {
    marketplace: "amazon",
    productName: product.name,
    brand: product.competitor,
    productId: product.sku || product.id,
    price: product.currentPrice,
    originalPrice: product.previousPrice || product.currentPrice,
    currency: product.currency || "INR",
    stockStatus: product.stockStatus,
    rating: 4.5,
    reviewCount: 128,
    imageUrl: null,
    productUrl: product.url,
    lastChecked: product.lastChecked,
    isLive,
  }
}
