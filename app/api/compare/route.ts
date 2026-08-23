import { NextResponse } from "next/server"
import { executeBrightDataScrape } from "@/lib/brightdata/client"
import { scrapeFlipkartProduct, isFlipkartUrl } from "@/lib/brightdata/flipkart"
import {
  compareMarketplacePrices,
  compareStockStatus,
  detectOpportunities,
  normalizeShelfGuardProduct,
} from "@/lib/intelligence"
import type { MarketplaceProduct } from "@/lib/intelligence/types"
import { products } from "@/lib/mock"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const amazonUrl = String(body.amazonUrl || "https://www.amazon.in/dp/B0DG2SLR9F").trim()
    const flipkartUrl = String(body.flipkartUrl || "").trim()

    let amazonOffer: MarketplaceProduct
    let isAmazonLive = false
    let amazonError: string | null = null

    // 1. Live Amazon Extraction via existing DCA Scraper
    try {
      const amazonScrapeRes = await executeBrightDataScrape({ url: amazonUrl })
      if (amazonScrapeRes.data && amazonScrapeRes.data.length > 0) {
        amazonOffer = normalizeShelfGuardProduct(amazonScrapeRes.data[0], true)
        isAmazonLive = true
      } else {
        throw new Error("Bright Data Amazon scraper returned zero product records.")
      }
    } catch (err) {
      amazonError = err instanceof Error ? err.message : String(err)
      console.warn(`[API Compare] Amazon extraction warning: ${amazonError}`)
      // Explicit fallback labeled isLive: false
      amazonOffer = normalizeShelfGuardProduct(products[0], false)
    }

    // 2. Live Flipkart Extraction via Datasets v3 Scraper
    let flipkartOffer: MarketplaceProduct
    let isFlipkartLive = false
    let flipkartError: string | null = null

    if (flipkartUrl) {
      if (!isFlipkartUrl(flipkartUrl)) {
        flipkartError = "Provided URL is not a valid flipkart.com product URL."
        flipkartOffer = {
          marketplace: "flipkart",
          productName: amazonOffer.productName,
          brand: amazonOffer.brand,
          productId: `FK-INVALID`,
          price: Math.round(amazonOffer.price * 0.94),
          originalPrice: amazonOffer.originalPrice,
          currency: "INR",
          stockStatus: "in_stock",
          rating: 4.4,
          reviewCount: 156,
          imageUrl: null,
          productUrl: flipkartUrl,
          lastChecked: new Date().toISOString(),
          isLive: false,
        }
      } else {
        try {
          const flipkartScrapeRes = await scrapeFlipkartProduct(flipkartUrl)
          if (flipkartScrapeRes.product) {
            flipkartOffer = flipkartScrapeRes.product
            isFlipkartLive = true
          } else {
            throw new Error("Flipkart Datasets API returned no product record.")
          }
        } catch (err) {
          flipkartError = err instanceof Error ? err.message : String(err)
          console.warn(`[API Compare] Flipkart extraction error: ${flipkartError}`)
          flipkartOffer = {
            marketplace: "flipkart",
            productName: amazonOffer.productName,
            brand: amazonOffer.brand,
            productId: `FK-ERROR`,
            price: Math.round(amazonOffer.price * 0.94),
            originalPrice: amazonOffer.originalPrice,
            currency: "INR",
            stockStatus: "in_stock",
            rating: 4.4,
            reviewCount: 156,
            imageUrl: null,
            productUrl: flipkartUrl,
            lastChecked: new Date().toISOString(),
            isLive: false,
          }
        }
      }
    } else {
      // Demo Flipkart offer when no URL supplied
      flipkartOffer = {
        marketplace: "flipkart",
        productName: amazonOffer.productName,
        brand: amazonOffer.brand,
        productId: `FK-UNCONNECTED-${amazonOffer.productId}`,
        price: Math.round(amazonOffer.price * 0.94),
        originalPrice: amazonOffer.originalPrice,
        currency: "INR",
        stockStatus: "in_stock",
        rating: 4.4,
        reviewCount: 156,
        imageUrl: null,
        productUrl: "https://www.flipkart.com",
        lastChecked: new Date().toISOString(),
        isLive: false,
      }
    }

    const offers: MarketplaceProduct[] = [amazonOffer, flipkartOffer]

    // 3. Normalized Competitive Intelligence Comparison
    const priceSummary = compareMarketplacePrices(offers)
    const stockSummary = compareStockStatus(offers)
    const opportunities = detectOpportunities(offers, priceSummary, stockSummary)

    return NextResponse.json({
      success: true,
      amazon: {
        ...amazonOffer,
        isLive: isAmazonLive,
        error: amazonError,
      },
      flipkart: {
        ...flipkartOffer,
        isLive: isFlipkartLive,
        error: flipkartError,
      },
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

