import { NextResponse } from "next/server"
import { executeBrightDataScrape, resolveAmazonUrl } from "@/lib/brightdata/client"
import { scrapeFlipkartProduct, isFlipkartUrl } from "@/lib/brightdata/flipkart"
import { scrapeMyntraProduct, isMyntraUrl } from "@/lib/brightdata/myntra"
import {
  areProductsMatching,
  compareMarketplacePrices,
  compareStockStatus,
  detectOpportunities,
  normalizeShelfGuardProduct,
} from "@/lib/intelligence"
import type { MarketplaceProduct } from "@/lib/intelligence/types"

/**
 * Wraps a promise with a hard timeout per scraper request.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} request timed out after ${Math.round(timeoutMs / 1000)}s`))
    }, timeoutMs)

    promise
      .then((res) => {
        clearTimeout(timer)
        resolve(res)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * Executes a scraper function with 1 automatic retry on transient HTTP 429/5xx/network errors.
 */
async function executeWithRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    if (
      errMsg.includes("429") ||
      errMsg.includes("500") ||
      errMsg.includes("502") ||
      errMsg.includes("503") ||
      errMsg.includes("504") ||
      errMsg.includes("fetch failed") ||
      errMsg.includes("socket")
    ) {
      console.warn(`[${label}] Transient error encountered ('${errMsg}'). Retrying in 1.5s...`)
      await new Promise((r) => setTimeout(r, 1500))
      return await fn()
    }
    throw err
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const rawAmazonUrl = String(body.amazonUrl || "").trim()
    const flipkartUrl = String(body.flipkartUrl || "").trim()
    const myntraUrl = String(body.myntraUrl || "").trim()
    const scanId = String(body.scanId || `scan-${Date.now()}`)

    const hasAmazonUrl = Boolean(rawAmazonUrl && rawAmazonUrl.length > 5)
    const hasFlipkartUrl = Boolean(flipkartUrl && flipkartUrl.length > 5)
    const hasMyntraUrl = Boolean(myntraUrl && myntraUrl.length > 5)

    console.log(`[SCAN] Scan ID: ${scanId}`)
    console.log(`[SCAN] Amazon URL received: ${hasAmazonUrl}`)
    console.log(`[SCAN] Flipkart URL received: ${hasFlipkartUrl}`)
    console.log(`[SCAN] Myntra URL received: ${hasMyntraUrl}`)

    // 1. Amazon Resolution
    let amazonUrl = rawAmazonUrl
    if (hasAmazonUrl) {
      console.log(`[AMAZON] request started`)
      amazonUrl = await resolveAmazonUrl(rawAmazonUrl)
    }

    // 2. Concurrent Marketplace Scrapers with Independent Promise.allSettled + 65s Max Timeout per Channel
    const SCRAPER_TIMEOUT_MS = 65000

    const amazonTask = hasAmazonUrl
      ? withTimeout(
          executeWithRetry(() => executeBrightDataScrape({ url: amazonUrl }), "AMAZON"),
          SCRAPER_TIMEOUT_MS,
          "Amazon"
        )
      : Promise.reject(new Error("No Amazon URL provided"))

    const flipkartTask = hasFlipkartUrl
      ? withTimeout(
          executeWithRetry(() => scrapeFlipkartProduct(flipkartUrl), "FLIPKART"),
          SCRAPER_TIMEOUT_MS,
          "Flipkart"
        )
      : Promise.reject(new Error("No Flipkart URL provided"))

    const myntraTask = hasMyntraUrl
      ? withTimeout(
          executeWithRetry(() => scrapeMyntraProduct(myntraUrl), "MYNTRA"),
          SCRAPER_TIMEOUT_MS,
          "Myntra"
        )
      : Promise.reject(new Error("No Myntra URL provided"))

    const [amazonResult, flipkartResult, myntraResult] = await Promise.allSettled([
      amazonTask,
      flipkartTask,
      myntraTask,
    ])

    // --- 1. Process Amazon Result ---
    let amazonOffer: MarketplaceProduct
    let amazonError: string | null = null

    console.log(`[AMAZON] URL: ${rawAmazonUrl || "none"}`)

    if (amazonResult.status === "fulfilled" && amazonResult.value.data?.length) {
      const rawRecord = amazonResult.value.data[0]
      console.log(`[AMAZON] HTTP STATUS: 200`)
      console.log(`[AMAZON] RESPONSE TYPE: Array (${amazonResult.value.data.length} records)`)
      console.log(`[AMAZON] RESPONSE KEYS: [${Object.keys(rawRecord).join(", ")}]`)

      amazonOffer = normalizeShelfGuardProduct(rawRecord, true)
      amazonOffer.productUrl = rawAmazonUrl || amazonUrl

      console.log(`[AMAZON] TITLE: ${amazonOffer.productName}`)
      console.log(`[AMAZON] PRICE: ${amazonOffer.price}`)
      console.log(`[AMAZON] ASIN: ${amazonOffer.productId}`)

      if (amazonOffer.price <= 0) {
        amazonOffer.isLive = false
        amazonOffer.productName = hasAmazonUrl ? "Unable to Retrieve" : "Not Provided"
        amazonError = "Bright Data Amazon scraper returned a record without a valid price > 0."
        console.log(`[AMAZON] ERROR: ${amazonError}`)
      } else {
        console.log(`[AMAZON] ERROR: null`)
      }
    } else {
      amazonError =
        amazonResult.status === "rejected"
          ? amazonResult.reason?.message || "Amazon scraper failed"
          : "Bright Data Amazon scraper returned zero product records."
      console.log(`[AMAZON] ERROR: ${amazonError}`)
      amazonOffer = {
        marketplace: "amazon",
        productName: hasAmazonUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Amazon",
        productId: "AMZ-UNAVAILABLE",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: rawAmazonUrl,
        lastChecked: new Date().toISOString(),
        isLive: false,
      }
    }

    // --- 2. Process Flipkart Result ---
    let flipkartOffer: MarketplaceProduct
    let flipkartError: string | null = null

    if (hasFlipkartUrl) {
      console.log(`[FLIPKART] request started`)
    }

    if (flipkartResult.status === "fulfilled" && flipkartResult.value.product) {
      console.log(`[FLIPKART] response received`)
      flipkartOffer = flipkartResult.value.product
      if (!flipkartResult.value.success || flipkartOffer.price <= 0) {
        flipkartOffer.isLive = false
        flipkartOffer.price = 0
        flipkartOffer.productName = hasFlipkartUrl ? "Unable to Retrieve" : "Not Provided"
        flipkartError = flipkartResult.value.error || "Flipkart listing unavailable"
      }
      console.log(`[FLIPKART] parsed price: ${flipkartOffer.price}`)
      console.log(`[FLIPKART] live: ${flipkartOffer.isLive}`)
      console.log(`[FLIPKART] error: ${flipkartError || "none"}`)
    } else {
      flipkartError =
        hasFlipkartUrl && !isFlipkartUrl(flipkartUrl)
          ? "Invalid Flipkart product URL"
          : flipkartResult.status === "rejected"
            ? flipkartResult.reason?.message || "Flipkart scraper error"
            : "Flipkart listing unavailable"
      if (hasFlipkartUrl) console.log(`[FLIPKART] error: ${flipkartError}`)
      flipkartOffer = {
        marketplace: "flipkart",
        productName: hasFlipkartUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Flipkart",
        productId: "FK-UNAVAILABLE",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: flipkartUrl || "https://www.flipkart.com",
        lastChecked: new Date().toISOString(),
        isLive: false,
      }
    }

    // --- 3. Process Myntra Result ---
    let myntraOffer: MarketplaceProduct
    let myntraError: string | null = null

    if (hasMyntraUrl) {
      console.log(`[MYNTRA] request started`)
    }

    if (myntraResult.status === "fulfilled" && myntraResult.value.product) {
      console.log(`[MYNTRA] response received`)
      myntraOffer = myntraResult.value.product
      if (!myntraResult.value.success || myntraOffer.price <= 0) {
        myntraOffer.isLive = false
        myntraOffer.price = 0
        myntraOffer.productName = hasMyntraUrl ? "Unable to Retrieve" : "Not Provided"
        myntraError = myntraResult.value.error || "Myntra listing unavailable"
      }
      console.log(`[MYNTRA] parsed price: ${myntraOffer.price}`)
      console.log(`[MYNTRA] live: ${myntraOffer.isLive}`)
      console.log(`[MYNTRA] error: ${myntraError || "none"}`)
    } else {
      myntraError =
        hasMyntraUrl && !isMyntraUrl(myntraUrl)
          ? "Invalid Myntra product URL"
          : myntraResult.status === "rejected"
            ? myntraResult.reason?.message || "Myntra scraper error"
            : "Myntra listing unavailable"
      if (hasMyntraUrl) console.log(`[MYNTRA] error: ${myntraError}`)
      myntraOffer = {
        marketplace: "myntra",
        productName: hasMyntraUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Myntra",
        productId: "MYNTRA-UNAVAILABLE",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: myntraUrl || "https://www.myntra.com",
        lastChecked: new Date().toISOString(),
        isLive: false,
      }
    }

    const offers: MarketplaceProduct[] = [
      amazonOffer,
      flipkartOffer,
      myntraOffer,
    ]

    // Evaluate Product Similarity / Matching
    const matchResult = areProductsMatching(offers)

    // Intelligence Calculations (strictly on isLive === true & price > 0)
    const priceSummary = compareMarketplacePrices(offers)
    const stockSummary = compareStockStatus(offers)
    const opportunities = detectOpportunities(offers, priceSummary, stockSummary)

    // Determine normalized product name from first successful live offer
    const firstLiveOffer = offers.find((o) => o.isLive && o.price > 0)
    const commonProductName = firstLiveOffer ? firstLiveOffer.productName : "Marketplace Listing"
    const commonBrand = firstLiveOffer ? firstLiveOffer.brand : "Brand"

    return NextResponse.json({
      success: true,
      productName: commonProductName,
      brand: commonBrand,
      productsMatch: matchResult.isMatch,
      matchMessage: matchResult.message,
      amazon: { ...amazonOffer, error: amazonError, hasUrl: hasAmazonUrl },
      flipkart: { ...flipkartOffer, error: flipkartError, hasUrl: hasFlipkartUrl },
      myntra: { ...myntraOffer, error: myntraError, hasUrl: hasMyntraUrl },
      comparison: {
        lowestPrice: priceSummary.lowestPrice,
        highestPrice: priceSummary.highestPrice,
        priceDifference: priceSummary.priceSpread,
        priceSpreadPercentage: priceSummary.priceSpreadPercentage,
        cheapestMarketplace: priceSummary.cheapestMarketplace,
        mostExpensiveMarketplace: priceSummary.mostExpensiveMarketplace,
        stockSummary,
      },
      opportunities,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Internal compare route error"
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
