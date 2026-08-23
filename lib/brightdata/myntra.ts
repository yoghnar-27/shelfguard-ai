import type { MarketplaceProduct } from "@/lib/intelligence/types"
import { parseBrightDataPrice, parseBrightDataStockStatus } from "./mapper"

/**
 * Server-Only Myntra Scraper Client via Bright Data Datasets v3 API
 *
 * Scrapes Myntra PDP pages using dataset gd_lptvxr8b1qx1d9thgp.
 * Ensures API key remains strictly on the server.
 */

if (typeof window !== "undefined") {
  throw new Error("Myntra scraper module cannot be imported in client-side code.")
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
 * Validates that the input string is a valid Myntra URL.
 */
export function isMyntraUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url.trim())
    return parsed.hostname.toLowerCase().includes("myntra.com")
  } catch {
    return false
  }
}

/**
 * Maps raw Bright Data Myntra extracted records into normalized MarketplaceProduct model.
 * Does NOT fabricate missing fields — uses 0 / null if field is absent.
 */
export function mapMyntraToMarketplaceProduct(
  rawRecord: Record<string, unknown>,
  fallbackUrl: string
): MarketplaceProduct {
  console.log(`[Myntra Datasets Mapper] Raw record keys:`, Object.keys(rawRecord))

  const brand = String(
    rawRecord.brand ||
      rawRecord.brand_name ||
      rawRecord.title ||
      rawRecord.seller ||
      rawRecord.seller_name ||
      "Myntra Brand"
  ).trim()

  const rawTitle = String(rawRecord.title || "").trim()
  const rawDesc = String(
    rawRecord.product_description ||
      rawRecord.description ||
      rawRecord.name ||
      rawRecord.product_name ||
      ""
  ).trim()

  const title = rawDesc
    ? rawTitle && !rawDesc.toLowerCase().includes(rawTitle.toLowerCase())
      ? `${rawTitle} ${rawDesc}`
      : rawDesc
    : rawTitle || "Myntra Marketplace Product"

  const sellingPrice =
    parseBrightDataPrice(rawRecord.final_price) ||
    parseBrightDataPrice(rawRecord.discounted_price) ||
    parseBrightDataPrice(rawRecord.price) ||
    parseBrightDataPrice(rawRecord.current_price) ||
    parseBrightDataPrice(rawRecord.buybox_price) ||
    parseBrightDataPrice(rawRecord.initial_price) ||
    parseBrightDataPrice(rawRecord.mrp)

  const listPrice =
    parseBrightDataPrice(rawRecord.initial_price) ||
    parseBrightDataPrice(rawRecord.mrp) ||
    parseBrightDataPrice(rawRecord.original_price) ||
    parseBrightDataPrice(rawRecord.previous_price) ||
    parseBrightDataPrice(rawRecord.list_price) ||
    parseBrightDataPrice(rawRecord.price) ||
    sellingPrice

  const originalPrice = listPrice > sellingPrice ? listPrice : sellingPrice

  const stockStatus = parseBrightDataStockStatus(
    rawRecord.stock_status as string,
    (rawRecord.in_stock ?? rawRecord.availability) as string | boolean
  )

  const rating =
    typeof rawRecord.rating === "number"
      ? rawRecord.rating
      : typeof rawRecord.star_rating === "number"
        ? rawRecord.star_rating
        : typeof rawRecord.stars === "number"
          ? rawRecord.stars
          : parseBrightDataPrice(rawRecord.rating || rawRecord.star_rating) || null

  const reviewCount =
    typeof rawRecord.ratings_count === "number"
      ? rawRecord.ratings_count
      : typeof rawRecord.reviews_count === "number"
        ? rawRecord.reviews_count
        : typeof rawRecord.review_count === "number"
          ? rawRecord.review_count
          : parseBrightDataPrice(rawRecord.ratings_count || rawRecord.reviews_count) || null

  const imageUrl =
    typeof rawRecord.image_url === "string"
      ? rawRecord.image_url
      : typeof rawRecord.image === "string"
        ? rawRecord.image
        : Array.isArray(rawRecord.images) && typeof rawRecord.images[0] === "string"
          ? (rawRecord.images[0] as string)
          : null

  const productId = String(
    rawRecord.product_id ||
      rawRecord.style_id ||
      rawRecord.item_id ||
      rawRecord.id ||
      "MYNTRA-PDP"
  )

  return {
    marketplace: "myntra",
    productName: title,
    brand,
    productId,
    price: sellingPrice,
    originalPrice,
    currency: String(rawRecord.currency || "INR").trim(),
    stockStatus,
    rating,
    reviewCount,
    imageUrl,
    productUrl: String(rawRecord.url || rawRecord.link || fallbackUrl),
    lastChecked: new Date().toISOString(),
    isLive: sellingPrice > 0,
  }
}

export type MyntraScrapeResult = {
  success: boolean
  source: "live_brightdata" | "unconnected"
  datasetId: string
  product: MarketplaceProduct
  error?: string
}

/**
 * Triggers live extraction for a Myntra product URL using Bright Data Datasets v3 API.
 */
export async function scrapeMyntraProduct(url: string): Promise<MyntraScrapeResult> {
  const apiKey = cleanEnvString(process.env.BRIGHTDATA_API_KEY)
  const datasetId = cleanEnvString(
    process.env.MYNTRA_DATASET_ID || "gd_lptvxr8b1qx1d9thgp"
  )
  const baseUrl = cleanEnvString(
    process.env.BRIGHTDATA_API_BASE_URL || "https://api.brightdata.com"
  )

  const trimmedUrl = url.trim()

  if (!apiKey) {
    return {
      success: false,
      source: "unconnected",
      datasetId,
      product: {
        marketplace: "myntra",
        productName: trimmedUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Myntra",
        productId: "MYNTRA-UNAVAILABLE",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: trimmedUrl || "https://www.myntra.com",
        lastChecked: new Date().toISOString(),
        isLive: false,
      },
      error: "Bright Data API key missing. Ensure BRIGHTDATA_API_KEY is configured.",
    }
  }

  if (!isMyntraUrl(trimmedUrl)) {
    return {
      success: false,
      source: "unconnected",
      datasetId,
      product: {
        marketplace: "myntra",
        productName: trimmedUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Myntra",
        productId: "MYNTRA-UNAVAILABLE",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: trimmedUrl || "https://www.myntra.com",
        lastChecked: new Date().toISOString(),
        isLive: false,
      },
      error: "Invalid Myntra product URL. Must contain 'myntra.com'.",
    }
  }

  const endpoint = `${baseUrl}/datasets/v3/scrape?dataset_id=${encodeURIComponent(datasetId)}&format=json`
  const payload = [{ url: trimmedUrl }]

  console.log(`[Myntra Scraper] POST ${endpoint}`)
  console.log(`[Myntra Scraper] Target URL: ${trimmedUrl}`)

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    let bodyText = await response.text().catch(() => "")

    if (!response.ok && response.status !== 202) {
      console.log(`[Myntra Scraper] Response error body: ${bodyText}`)
      throw new Error(`Myntra Datasets API HTTP ${response.status}: ${bodyText}`)
    }

    // Check if response contains a snapshot_id
    let snapshotId: string | null = null
    try {
      const parsedObj = JSON.parse(bodyText)
      if (parsedObj && typeof parsedObj === "object" && !Array.isArray(parsedObj)) {
        if (parsedObj.snapshot_id || parsedObj.id) {
          snapshotId = String(parsedObj.snapshot_id || parsedObj.id)
        }
      }
    } catch {
      // NDJSON or raw text
    }

    if (snapshotId) {
      console.log(`[Myntra Scraper] Received snapshot_id ${snapshotId}. Polling snapshot data...`)
      const snapEndpoint = `${baseUrl}/datasets/v3/snapshot/${encodeURIComponent(snapshotId)}?format=json`
      const startTime = Date.now()
      const maxPollMs = 35000

      while (Date.now() - startTime < maxPollMs) {
        await new Promise((r) => setTimeout(r, 1500))
        const snapRes = await fetch(snapEndpoint, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })

        if (snapRes.ok) {
          const snapText = await snapRes.text()
          if (snapText && snapText.trim()) {
            try {
              const snapParsed = JSON.parse(snapText)
              if (snapParsed && typeof snapParsed === "object" && snapParsed.status) {
                const statusStr = String(snapParsed.status).toLowerCase()
                if (["running", "building", "queued", "pending"].includes(statusStr)) {
                  console.log(`[Myntra Scraper] Snapshot status '${statusStr}'. Retrying poll...`)
                  continue
                }
              }
            } catch {
              // Array or NDJSON ready!
            }
            bodyText = snapText
            console.log(`[Myntra Scraper] Snapshot data ready! Length: ${bodyText.length}`)
            break
          }
        }
      }
    }

    console.log(`[Myntra Scraper] Raw response body length: ${bodyText.length}`)

    let rawRecords: Array<Record<string, unknown>> = []

    try {
      const jsonParsed = JSON.parse(bodyText)
      if (Array.isArray(jsonParsed)) {
        rawRecords = jsonParsed as Array<Record<string, unknown>>
      } else if (jsonParsed && typeof jsonParsed === "object") {
        const objData = jsonParsed as Record<string, unknown>
        if (Array.isArray(objData.data)) {
          rawRecords = objData.data as Array<Record<string, unknown>>
        } else if (Array.isArray(objData.records)) {
          rawRecords = objData.records as Array<Record<string, unknown>>
        } else if (!objData.snapshot_id && !objData.status) {
          rawRecords = [objData]
        }
      }
    } catch {
      // NDJSON fallback (split by line)
      const lines = bodyText.split("\n").map((l) => l.trim()).filter(Boolean)
      for (const line of lines) {
        try {
          const parsedLine = JSON.parse(line) as Record<string, unknown>
          if (parsedLine && typeof parsedLine === "object" && !parsedLine.status) {
            rawRecords.push(parsedLine)
          }
        } catch {
          // ignore unparseable line
        }
      }
    }

    if (!rawRecords.length) {
      throw new Error(`Myntra Datasets API returned no product records: ${bodyText.slice(0, 200)}`)
    }

    const firstRecord = rawRecords[0]

    if (firstRecord.error) {
      const errDetail = String(firstRecord.error)
      console.log(`[Myntra Scraper] Bright Data record error: ${errDetail}`)
      throw new Error(`Bright Data Myntra Dataset Error: ${errDetail}`)
    }

    if (firstRecord.warning) {
      console.warn(`[Myntra Scraper] Bright Data dataset warning: ${firstRecord.warning}`)
    }

    const mappedProduct = mapMyntraToMarketplaceProduct(firstRecord, trimmedUrl)

    if (mappedProduct.price <= 0) {
      throw new Error(
        `Myntra Datasets API record did not contain a valid price > 0. Keys found: [${Object.keys(
          firstRecord
        ).join(", ")}]`
      )
    }

    return {
      success: true,
      source: "live_brightdata",
      datasetId,
      product: mappedProduct,
    }
  } catch (err) {
    const sanitized = sanitizeError(err, apiKey)
    return {
      success: false,
      source: "unconnected",
      datasetId,
      product: {
        marketplace: "myntra",
        productName: trimmedUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Myntra",
        productId: "MYNTRA-UNAVAILABLE",
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
