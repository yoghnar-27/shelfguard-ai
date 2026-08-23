import type { Product, StockStatus } from "@/lib/mock/types"
import type { BrightDataPriceField, BrightDataProduct } from "./types"

/**
 * Safely parses a numeric money price value from various Bright Data price field formats.
 * Handles numbers, formatted strings (e.g., "$1,299.99", "₹499.00"), and nested price objects.
 */
export function parseBrightDataPrice(priceField?: BrightDataPriceField): number {
  if (priceField === null || priceField === undefined) {
    return 0
  }

  if (typeof priceField === "number") {
    return Number.isNaN(priceField) ? 0 : priceField
  }

  if (typeof priceField === "string") {
    const cleaned = priceField.replace(/[^0-9.]/g, "")
    const parsed = Number.parseFloat(cleaned)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  if (typeof priceField === "object") {
    const val = priceField.value ?? priceField.amount
    if (val !== undefined && val !== null) {
      return parseBrightDataPrice(val as BrightDataPriceField)
    }
  }

  return 0
}

/**
 * Determines standard StockStatus based on Bright Data availability & stock_status indicators.
 */
export function parseBrightDataStockStatus(
  stockStatus?: string | null,
  availability?: boolean | string | null
): StockStatus {
  if (availability === false) {
    return "out_of_stock"
  }

  const combinedStr = `${stockStatus ?? ""} ${typeof availability === "string" ? availability : ""}`.toLowerCase()

  if (
    combinedStr.includes("out of stock") ||
    combinedStr.includes("currently unavailable") ||
    combinedStr.includes("sold out") ||
    combinedStr.includes("unavailable")
  ) {
    return "out_of_stock"
  }

  if (
    combinedStr.includes("only") ||
    combinedStr.includes("low stock") ||
    combinedStr.includes("few left") ||
    combinedStr.includes("limited stock")
  ) {
    return "low_stock"
  }

  return "in_stock"
}

/**
 * Converts a raw Bright Data extracted item into ShelfGuard's Product domain model.
 */
export function mapBrightDataToShelfGuardProduct(raw: BrightDataProduct): Product {
  const currentPrice = parseBrightDataPrice(raw.current_price)
  const originalPrice = parseBrightDataPrice(raw.original_price)
  const previousPrice = originalPrice > 0 ? originalPrice : currentPrice

  const competitorName = (raw.brand || raw.seller || "Competitor").trim()
  const competitorId =
    competitorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "competitor"

  const rawId = raw.product_id_or_asin || (raw.product_url ? raw.product_url.split("/").pop() : null)
  const id = rawId ? String(rawId).trim() : `bg-${Date.now()}`

  const stockStatus = parseBrightDataStockStatus(raw.stock_status, raw.availability)

  let stockUnits: number | null = null
  if (typeof raw.stock_status === "string") {
    const unitMatch = raw.stock_status.match(/\d+/)
    if (unitMatch) {
      stockUnits = Number.parseInt(unitMatch[0], 10)
    }
  }

  return {
    id,
    name: (raw.product_name || "Extracted Marketplace Product").trim(),
    sku: raw.product_id_or_asin || id,
    competitor: competitorName,
    competitorId,
    category: (raw.product_category || "General").trim(),
    url: raw.product_url || "",
    currentPrice,
    previousPrice,
    currency: (raw.currency || "INR").trim(),
    stockStatus,
    stockUnits,
    lastChecked: new Date().toISOString(),
    monitorStatus: "watching",
    variants: [],
    imageTone: "from-emerald-500/25 to-slate-900/40",
  }
}
