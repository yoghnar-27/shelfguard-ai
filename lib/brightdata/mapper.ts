import type { Product, StockStatus } from "@/lib/mock/types"
import type { BrightDataProduct } from "./types"



/**
 * Safely parses a numeric money price value from various Bright Data price field formats.
 * Handles numbers, formatted strings (e.g., "$1,299.99", "₹1,999.00", "Rs. 1,999"), and nested price objects.
 */
export function parseBrightDataPrice(priceField?: unknown): number {
  if (priceField === null || priceField === undefined) {
    return 0
  }

  if (typeof priceField === "number") {
    return Number.isNaN(priceField) ? 0 : priceField
  }

  if (typeof priceField === "string") {
    // Strip currency symbols (₹, INR, Rs, USD, $), commas, and spaces
    const cleaned = priceField
      .replace(/₹|INR|Rs\.?|USD|\$|,|\s/gi, "")
      .trim()
    const match = cleaned.match(/\d+(?:\.\d+)?/)
    if (match) {
      const parsed = Number.parseFloat(match[0])
      return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100
    }
    return 0
  }

  if (Array.isArray(priceField) && priceField.length > 0) {
    for (const item of priceField) {
      const val = parseBrightDataPrice(item)
      if (val > 0) return val
    }
  }

  if (typeof priceField === "object") {
    const obj = priceField as Record<string, unknown>
    const val =
      obj.value ??
      obj.amount ??
      obj.price ??
      obj.raw ??
      obj.discounted_price ??
      obj.final_price ??
      obj.current_price ??
      obj.sale_price ??
      obj.offer_price ??
      obj.buybox_price ??
      obj.our_price
    if (val !== undefined && val !== null) {
      return parseBrightDataPrice(val)
    }
  }

  return 0
}

/**
 * Extracts clean 10-character ASIN from Amazon URLs or product ID strings.
 */
export function extractAmazonAsin(val?: string | null): string {
  if (!val) return ""
  const match = val.match(/(?:dp|gp\/product|d)\/([A-Z0-9]{10})/i)
  if (match && match[1]) {
    return match[1].toUpperCase()
  }
  const clean = val.split("?")[0].split("#")[0].trim()
  const parts = clean.split("/").filter(Boolean)
  const last = parts.pop() || ""
  if (/^[A-Z0-9]{10}$/i.test(last)) {
    return last.toUpperCase()
  }
  return last || "ASIN-UNKNOWN"
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
 * Inspects all common field variations returned by Bright Data Amazon scrapers.
 */
export function mapBrightDataToShelfGuardProduct(raw: BrightDataProduct): Product {
  // Temporary safe server-side diagnostic logging (with API key redacted)
  console.log(`[Amazon BrightData Mapper] Raw record keys:`, Object.keys(raw))
  if (raw.price || raw.current_price || raw.final_price || raw.buybox_price) {
    console.log(`[Amazon BrightData Mapper] Extracted price fields:`, {
      price: raw.price,
      current_price: raw.current_price,
      final_price: raw.final_price,
      buybox_price: raw.buybox_price,
      price_raw: raw.price_raw,
      initial_price: raw.initial_price,
      mrp: raw.mrp,
      original_price: raw.original_price,
    })
  }

  const currentPrice =
    parseBrightDataPrice(raw.current_price) ||
    parseBrightDataPrice(raw.price) ||
    parseBrightDataPrice(raw.final_price) ||
    parseBrightDataPrice(raw.buybox_price) ||
    parseBrightDataPrice(raw.buy_box_price) ||
    parseBrightDataPrice(raw.price_raw) ||
    parseBrightDataPrice(raw.initial_price) ||
    parseBrightDataPrice(raw.discounted_price) ||
    parseBrightDataPrice(raw.our_price) ||
    parseBrightDataPrice(raw.unit_price) ||
    parseBrightDataPrice(raw.sale_price) ||
    parseBrightDataPrice(raw.offer_price) ||
    parseBrightDataPrice(raw.price_str) ||
    parseBrightDataPrice(raw.price_final) ||
    parseBrightDataPrice(raw.pricing) ||
    parseBrightDataPrice(raw.deal_price) ||
    parseBrightDataPrice(raw.price_value) ||
    parseBrightDataPrice(raw.amount) ||
    parseBrightDataPrice(raw.value) ||
    parseBrightDataPrice(raw.buying_price) ||
    parseBrightDataPrice(raw.list_price) ||
    parseBrightDataPrice(raw.buy_box) ||
    parseBrightDataPrice(raw.offers) ||
    parseBrightDataPrice(raw.prices)

  const originalPrice =
    parseBrightDataPrice(raw.original_price) ||
    parseBrightDataPrice(raw.mrp) ||
    parseBrightDataPrice(raw.list_price) ||
    parseBrightDataPrice(raw.strikethrough_price) ||
    parseBrightDataPrice(raw.rrp) ||
    parseBrightDataPrice(raw.base_price) ||
    parseBrightDataPrice(raw.previous_price) ||
    currentPrice

  const previousPrice = originalPrice > 0 ? originalPrice : currentPrice

  const productName = String(
    raw.product_name ||
      raw.title ||
      raw.name ||
      raw.product_title ||
      raw.item_name ||
      raw.headline ||
      "Amazon Marketplace Product"
  ).trim()

  const competitorName = String(
    raw.brand ||
      raw.seller ||
      raw.brand_name ||
      raw.seller_name ||
      raw.by_line ||
      raw.store ||
      raw.manufacturer ||
      "Amazon Competitor"
  ).trim()

  const competitorId =
    competitorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "competitor"

  const parsedAsin = extractAmazonAsin(
    String(
      raw.asin ||
        raw.product_id_or_asin ||
        raw.sku ||
        raw.product_id ||
        raw.item_id ||
        raw.id ||
        raw.product_url ||
        ""
    )
  )
  const rawAsin = parsedAsin || `ASIN-${Date.now()}`

  const category = String(
    raw.product_category || raw.category || raw.department || raw.category_tree || "General"
  ).trim()

  const url = String(raw.product_url || raw.url || raw.link || raw.canonical_url || "").trim()

  const stockStatus = parseBrightDataStockStatus(raw.stock_status, raw.availability)

  let stockUnits: number | null = null
  if (typeof raw.stock_status === "string") {
    const unitMatch = raw.stock_status.match(/\d+/)
    if (unitMatch) {
      stockUnits = Number.parseInt(unitMatch[0], 10)
    }
  }

  return {
    id: rawAsin,
    name: productName,
    sku: rawAsin.startsWith("ASIN:") ? rawAsin : `ASIN: ${rawAsin}`,
    competitor: competitorName,
    competitorId,
    category,
    url,
    currentPrice,
    previousPrice,
    currency: String(raw.currency || raw.price_currency || "INR").trim(),
    stockStatus,
    stockUnits,
    lastChecked: new Date().toISOString(),
    monitorStatus: "watching",
    variants: [],
    imageTone: "from-emerald-500/25 to-slate-900/40",
  }
}
