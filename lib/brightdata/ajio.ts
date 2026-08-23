import type { MarketplaceProduct } from "@/lib/intelligence/types"
import { parseBrightDataPrice, parseBrightDataStockStatus } from "./mapper"

/**
 * Server-Only AJIO Scraper Adapter via Bright Data Datasets v3 API
 */

if (typeof window !== "undefined") {
  throw new Error("AJIO scraper module cannot be imported in client-side code.")
}

function sanitizeError(error: unknown, apiKey?: string): Error {
  const message = error instanceof Error ? error.message : String(error)
  if (!apiKey) return new Error(message)
  return new Error(message.replaceAll(apiKey, "[REDACTED_API_KEY]"))
}

function cleanEnvString(val?: string): string {
  if (!val) return ""
  return val.trim().replace(/^["']|["']$/g, "").trim()
}

export function isAjioUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url.trim())
    return parsed.hostname.toLowerCase().includes("ajio.com")
  } catch {
    return false
  }
}

export function mapAjioToMarketplaceProduct(
  rawRecord: Record<string, unknown>,
  fallbackUrl: string
): MarketplaceProduct {
  const title = String(
    rawRecord.title ||
      rawRecord.name ||
      rawRecord.product_name ||
      rawRecord.product_title ||
      "AJIO Product"
  ).trim()

  const brand = String(
    rawRecord.brand ||
      rawRecord.brand_name ||
      rawRecord.seller ||
      "AJIO Brand"
  ).trim()

  const price =
    parseBrightDataPrice(rawRecord.discounted_price) ||
    parseBrightDataPrice(rawRecord.price) ||
    parseBrightDataPrice(rawRecord.current_price) ||
    parseBrightDataPrice(rawRecord.final_price) ||
    parseBrightDataPrice(rawRecord.mrp)

  const originalPrice =
    parseBrightDataPrice(rawRecord.mrp) ||
    parseBrightDataPrice(rawRecord.original_price) ||
    parseBrightDataPrice(rawRecord.initial_price) ||
    price

  const stockStatus = parseBrightDataStockStatus(
    rawRecord.stock_status as string,
    rawRecord.availability as string | boolean
  )

  const rating =
    typeof rawRecord.rating === "number"
      ? rawRecord.rating
      : typeof rawRecord.stars === "number"
        ? rawRecord.stars
        : null

  const reviewCount =
    typeof rawRecord.reviews_count === "number"
      ? rawRecord.reviews_count
      : typeof rawRecord.ratings_count === "number"
        ? rawRecord.ratings_count
        : null

  const imageUrl =
    typeof rawRecord.image_url === "string"
      ? rawRecord.image_url
      : typeof rawRecord.image === "string"
        ? rawRecord.image
        : null

  const productId = String(
    rawRecord.product_id ||
      rawRecord.id ||
      "AJIO-PDP"
  )

  return {
    marketplace: "amazon" as const,
    productName: title,
    brand,
    productId,
    price,
    originalPrice,
    currency: String(rawRecord.currency || "INR").trim(),
    stockStatus,
    rating,
    reviewCount,
    imageUrl,
    productUrl: String(rawRecord.url || rawRecord.link || fallbackUrl),
    lastChecked: new Date().toISOString(),
    isLive: price > 0,
  }
}

export type AjioScrapeResult = {
  success: boolean
  source: "live_brightdata" | "unconnected"
  datasetId?: string
  product: MarketplaceProduct
  error?: string
}

export async function scrapeAjioProduct(url: string): Promise<AjioScrapeResult> {
  const apiKey = cleanEnvString(process.env.BRIGHTDATA_API_KEY)
  const datasetId = cleanEnvString(process.env.AJIO_DATASET_ID)
  const baseUrl = cleanEnvString(
    process.env.BRIGHTDATA_API_BASE_URL || "https://api.brightdata.com"
  )

  const trimmedUrl = url.trim()
  if (!isAjioUrl(trimmedUrl)) {
    return {
      success: false,
      source: "unconnected",
      product: {
        marketplace: "amazon" as const,
        productName: "Not Connected",
        brand: "AJIO",
        productId: "AJIO-UNCONNECTED",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: trimmedUrl || "https://www.ajio.com",
        lastChecked: new Date().toISOString(),
        isLive: false,
      },
      error: "Invalid AJIO product URL. Must contain 'ajio.com'.",
    }
  }

  if (!apiKey || !datasetId) {
    return {
      success: false,
      source: "unconnected",
      product: {
        marketplace: "amazon" as const,
        productName: "Not Connected",
        brand: "AJIO",
        productId: "AJIO-UNCONNECTED",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: trimmedUrl,
        lastChecked: new Date().toISOString(),
        isLive: false,
      },
      error: "AJIO dataset integration not configured in environment.",
    }
  }

  const endpoint = `${baseUrl}/datasets/v3/scrape?dataset_id=${datasetId}&notify=false&include_errors=true`

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [{ url: trimmedUrl }],
        limit_per_input: null,
      }),
    })

    const bodyText = await response.text().catch(() => "No body")
    if (!response.ok) {
      throw new Error(`AJIO Datasets API HTTP ${response.status}: ${bodyText}`)
    }

    let rawRecords: Array<Record<string, unknown>> = []
    try {
      const parsed = JSON.parse(bodyText)
      if (Array.isArray(parsed)) rawRecords = parsed as Array<Record<string, unknown>>
      else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>
        if (Array.isArray(obj.data)) rawRecords = obj.data as Array<Record<string, unknown>>
        else rawRecords = [obj]
      }
    } catch {
      const lines = bodyText.split("\n").map((l) => l.trim()).filter(Boolean)
      for (const line of lines) {
        try {
          rawRecords.push(JSON.parse(line))
        } catch {
          // ignore
        }
      }
    }

    if (!rawRecords.length || !rawRecords[0]) {
      throw new Error("AJIO Datasets API returned no records.")
    }

    const mapped = mapAjioToMarketplaceProduct(rawRecords[0], trimmedUrl)
    if (mapped.price <= 0) {
      throw new Error("AJIO record contained no valid price > 0.")
    }

    return {
      success: true,
      source: "live_brightdata",
      datasetId,
      product: mapped,
    }
  } catch (err) {
    const sanitized = sanitizeError(err, apiKey)
    return {
      success: false,
      source: "unconnected",
      product: {
        marketplace: "amazon" as const,
        productName: "Not Connected",
        brand: "AJIO",
        productId: "AJIO-UNCONNECTED",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: trimmedUrl,
        lastChecked: new Date().toISOString(),
        isLive: false,
      },
      error: sanitized.message,
    }
  }
}
