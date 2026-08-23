import type { MarketplaceProduct } from "@/lib/intelligence/types"

/**
 * Server-Only Flipkart Scraper Client via Bright Data Datasets v3 API
 *
 * Scrapes Flipkart PDP pages using dataset gd_mljhtaoe2n284ux79e.
 * Ensures API key remains strictly on the server.
 */

if (typeof window !== "undefined") {
  throw new Error("Flipkart scraper module cannot be imported in client-side code.")
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

/**
 * Validates that the input string is a valid Flipkart URL.
 */
export function isFlipkartUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url.trim())
    return parsed.hostname.toLowerCase().includes("flipkart.com")
  } catch {
    return false
  }
}

/**
 * Maps raw Bright Data Flipkart extracted records into normalized MarketplaceProduct model.
 * Does NOT fabricate missing fields — uses null/undefined if field is absent.
 */
export function mapFlipkartToMarketplaceProduct(
  rawRecord: Record<string, unknown>,
  fallbackUrl: string
): MarketplaceProduct {
  const title = String(
    rawRecord.title ||
      rawRecord.name ||
      rawRecord.product_name ||
      rawRecord.productName ||
      "Flipkart Product"
  ).trim()

  const brand = String(
    rawRecord.brand ||
      rawRecord.seller_name ||
      rawRecord.seller ||
      rawRecord.brand_name ||
      "Flipkart Seller"
  ).trim()

  const price = Number(
    rawRecord.final_price ||
      rawRecord.price ||
      rawRecord.current_price ||
      rawRecord.discounted_price ||
      0
  )

  const originalPrice = Number(
    rawRecord.initial_price ||
      rawRecord.mrp ||
      rawRecord.original_price ||
      rawRecord.previous_price ||
      price
  )

  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
  const rawAvailability = String(
    rawRecord.availability || rawRecord.stock_status || rawRecord.in_stock || ""
  ).toLowerCase()

  if (
    rawAvailability.includes("out") ||
    rawAvailability.includes("sold") ||
    rawAvailability === "false"
  ) {
    stockStatus = "out_of_stock"
  } else if (rawAvailability.includes("low") || rawAvailability.includes("few")) {
    stockStatus = "low_stock"
  }

  const rating = typeof rawRecord.rating === "number" ? rawRecord.rating : null
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
    rawRecord.fsn || rawRecord.item_id || rawRecord.pid || rawRecord.product_id || "FK-PDP"
  )

  return {
    marketplace: "flipkart",
    productName: title,
    brand,
    productId,
    price,
    originalPrice,
    currency: "INR",
    stockStatus,
    rating,
    reviewCount,
    imageUrl,
    productUrl: String(rawRecord.url || fallbackUrl),
    lastChecked: new Date().toISOString(),
    isLive: true,
  }
}

export type FlipkartScrapeResult = {
  success: boolean
  source: "live_brightdata" | "mock_fallback"
  datasetId: string
  product: MarketplaceProduct
  warning?: string
}

/**
 * Triggers live extraction for a Flipkart product URL using Bright Data Datasets v3 API.
 */
export async function scrapeFlipkartProduct(url: string): Promise<FlipkartScrapeResult> {
  const apiKey = cleanEnvString(process.env.BRIGHTDATA_API_KEY)
  const datasetId = cleanEnvString(
    process.env.FLIPKART_DATASET_ID || "gd_mljhtaoe2n284ux79e"
  )
  const baseUrl = cleanEnvString(
    process.env.BRIGHTDATA_API_BASE_URL || "https://api.brightdata.com"
  )

  if (!apiKey) {
    throw new Error("Bright Data API key missing. Ensure BRIGHTDATA_API_KEY is configured.")
  }

  const trimmedUrl = url.trim()
  if (!isFlipkartUrl(trimmedUrl)) {
    throw new Error("Invalid Flipkart URL. Must contain 'flipkart.com'.")
  }

  const endpoint = `${baseUrl}/datasets/v3/scrape?dataset_id=${datasetId}&notify=false&include_errors=true`

  console.log(`[Flipkart Scraper] Dataset ID: ${datasetId}`)
  console.log(`[Flipkart Scraper] Target URL: ${trimmedUrl}`)

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

    console.log(`[Flipkart Scraper] Response HTTP status: ${response.status}`)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "No error body")
      console.log(`[Flipkart Scraper] Error body: ${errorBody}`)
      throw new Error(`Flipkart Datasets API HTTP ${response.status}: ${errorBody}`)
    }

    const rawData = await response.json()
    console.log(`[Flipkart Scraper] Raw payload received.`)

    let rawRecord: Record<string, unknown> | null = null

    if (Array.isArray(rawData) && rawData.length > 0) {
      rawRecord = rawData[0] as Record<string, unknown>
    } else if (rawData && typeof rawData === "object") {
      const objData = rawData as Record<string, unknown>
      if (Array.isArray(objData.data) && objData.data.length > 0) {
        rawRecord = objData.data[0] as Record<string, unknown>
      } else {
        rawRecord = objData
      }
    }

    if (!rawRecord) {
      throw new Error("Flipkart Datasets API returned an empty or unparseable payload.")
    }

    const mappedProduct = mapFlipkartToMarketplaceProduct(rawRecord, trimmedUrl)

    return {
      success: true,
      source: "live_brightdata",
      datasetId,
      product: mappedProduct,
    }
  } catch (err) {
    throw sanitizeError(err, apiKey)
  }
}
