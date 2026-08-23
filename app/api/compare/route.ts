import { NextResponse } from "next/server"
import { executeBrightDataScrape } from "@/lib/brightdata/client"
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const amazonUrl = String(body.amazonUrl || "https://www.amazon.in/dp/B0DG2SLR9F").trim()
    const flipkartUrl = String(body.flipkartUrl || "").trim()
    const myntraUrl = String(body.myntraUrl || "").trim()

    const hasAmazonUrl = Boolean(amazonUrl && amazonUrl.length > 5)
    const hasFlipkartUrl = Boolean(flipkartUrl && flipkartUrl.length > 5)
    const hasMyntraUrl = Boolean(myntraUrl && myntraUrl.length > 5)

    // Concurrent marketplace scraping via Promise.allSettled
    const [amazonResult, flipkartResult, myntraResult] =
      await Promise.allSettled([
        // 1. Amazon (DCA)
        executeBrightDataScrape({ url: amazonUrl }),
        // 2. Flipkart (v3)
        flipkartUrl ? scrapeFlipkartProduct(flipkartUrl) : Promise.reject(new Error("No Flipkart URL")),
        // 3. Myntra (v3)
        myntraUrl ? scrapeMyntraProduct(myntraUrl) : Promise.reject(new Error("No Myntra URL")),
      ])

    // --- 1. Amazon ---
    let amazonOffer: MarketplaceProduct
    let amazonError: string | null = null
    if (amazonResult.status === "fulfilled" && amazonResult.value.data?.length) {
      amazonOffer = normalizeShelfGuardProduct(amazonResult.value.data[0], true)
      if (amazonOffer.price <= 0) {
        amazonOffer.isLive = false
        amazonOffer.productName = hasAmazonUrl ? "Unable to Retrieve" : "Not Provided"
        amazonError = "Bright Data Amazon scraper returned a record without a valid price > 0."
      }
    } else {
      amazonError =
        amazonResult.status === "rejected"
          ? amazonResult.reason?.message || "Amazon scraper failed"
          : "Bright Data Amazon scraper returned zero product records."
      amazonOffer = {
        marketplace: "amazon",
        productName: hasAmazonUrl ? "Unable to Retrieve" : "Not Provided",
        brand: "Amazon",
        productId: "AMZ-UNAVAILABLE",
        price: 0,
        originalPrice: 0,
        currency: "INR",
        stockStatus: "out_of_stock",
        productUrl: amazonUrl,
        lastChecked: new Date().toISOString(),
        isLive: false,
      }
    }

    // --- 2. Flipkart ---
    let flipkartOffer: MarketplaceProduct
    let flipkartError: string | null = null
    if (flipkartResult.status === "fulfilled" && flipkartResult.value.product) {
      flipkartOffer = flipkartResult.value.product
      if (!flipkartResult.value.success || flipkartOffer.price <= 0) {
        flipkartOffer.isLive = false
        flipkartOffer.price = 0
        flipkartOffer.productName = hasFlipkartUrl ? "Unable to Retrieve" : "Not Provided"
        flipkartError = flipkartResult.value.error || "Flipkart listing unavailable"
      }
    } else {
      flipkartError =
        hasFlipkartUrl && !isFlipkartUrl(flipkartUrl)
          ? "Invalid Flipkart product URL"
          : flipkartResult.status === "rejected"
            ? flipkartResult.reason?.message || "Flipkart scraper error"
            : "Flipkart listing unavailable"
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

    // --- 3. Myntra ---
    let myntraOffer: MarketplaceProduct
    let myntraError: string | null = null
    if (myntraResult.status === "fulfilled" && myntraResult.value.product) {
      myntraOffer = myntraResult.value.product
      if (!myntraResult.value.success || myntraOffer.price <= 0) {
        myntraOffer.isLive = false
        myntraOffer.price = 0
        myntraOffer.productName = hasMyntraUrl ? "Unable to Retrieve" : "Not Provided"
        myntraError = myntraResult.value.error || "Myntra listing unavailable"
      }
    } else {
      myntraError =
        hasMyntraUrl && !isMyntraUrl(myntraUrl)
          ? "Invalid Myntra product URL"
          : myntraResult.status === "rejected"
            ? myntraResult.reason?.message || "Myntra scraper error"
            : "Myntra listing unavailable"
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
