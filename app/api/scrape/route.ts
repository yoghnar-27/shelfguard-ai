import { NextResponse } from "next/server"
import { executeBrightDataScrape, getBrightDataConfig } from "@/lib/brightdata/client"
import { mapBrightDataToShelfGuardProduct } from "@/lib/brightdata/mapper"
import type { BrightDataProduct } from "@/lib/brightdata/types"

export async function POST(request: Request) {
  try {
    // 1. Verify Environment Variable Configuration
    let hasConfig = true
    let configMessage = ""
    try {
      getBrightDataConfig()
    } catch (configError) {
      hasConfig = false
      configMessage = configError instanceof Error ? configError.message : "Bright Data config missing."
    }

    // 2. Parse and Validate Request Payload
    const body = await request.json().catch(() => ({}))
    const { url, rawProducts, collectorId } = body

    // 3. Process direct raw extracted payload (for payload mapping tests / webhook deliveries)
    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      const mapped = rawProducts.map((item: BrightDataProduct) => mapBrightDataToShelfGuardProduct(item))
      return NextResponse.json({
        success: true,
        source: "payload_mapping",
        count: mapped.length,
        data: mapped,
      })
    }

    // 4. Validate URL for triggering Bright Data collection
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "Please provide a valid product 'url' string or 'rawProducts' array in the request body.",
        },
        { status: 400 }
      )
    }

    // If config is missing, return fallback mock product
    if (!hasConfig) {
      const fallbackProduct = mapBrightDataToShelfGuardProduct({
        product_name: "Marketplace Product (Mock Fallback)",
        product_url: url,
        current_price: 1299,
        original_price: 1799,
        currency: "INR",
        availability: true,
        stock_status: "In Stock",
        seller: "Marketplace Seller",
        product_category: "General",
      })

      return NextResponse.json({
        success: true,
        source: "mock_fallback",
        count: 1,
        data: [fallbackProduct],
        warning: configMessage,
      })
    }

    // 5. Trigger Live Bright Data Scrape & Poll for Async Completion Server-Side
    try {
      const scrapeResult = await executeBrightDataScrape({
        url,
        collectorId,
      })

      return NextResponse.json({
        success: true,
        source: scrapeResult.source,
        count: scrapeResult.count,
        snapshotId: scrapeResult.snapshotId,
        data: scrapeResult.data,
      })
    } catch (liveError) {
      const message = liveError instanceof Error ? liveError.message : "Live scraping failed."
      
      // Fallback to mock product response so UI/Dashboard logic remains operational
      const fallbackProduct = mapBrightDataToShelfGuardProduct({
        product_name: "Marketplace Product (Mock Fallback)",
        product_url: url,
        current_price: 1299,
        original_price: 1799,
        currency: "INR",
        availability: true,
        stock_status: "In Stock",
        seller: "Marketplace Seller",
        product_category: "General",
      })

      return NextResponse.json({
        success: true,
        source: "mock_fallback",
        count: 1,
        data: [fallbackProduct],
        warning: message,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred."
    return NextResponse.json(
      {
        success: false,
        error: "SCRAPE_FAILED",
        message,
      },
      { status: 500 }
    )
  }
}

