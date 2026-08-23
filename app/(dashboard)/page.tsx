"use client"

import { useState } from "react"
import { CommandHero } from "@/components/dashboard/command-hero"
import { MarketRadar } from "@/components/market-radar/market-radar"
import { MarketplacePriceCard } from "@/components/comparison/marketplace-price-card"
import { PriceGap } from "@/components/comparison/price-gap"
import type { ScanStatusMap } from "@/components/scan/product-url-input"
import { ProductUrlInput } from "@/components/scan/product-url-input"
import { RecommendationPanel } from "@/components/opportunities/recommendation-panel"
import { PriceTrajectory } from "@/components/dashboard/price-trajectory"
import { Sparkles, ArrowRight, Loader2, AlertTriangle } from "lucide-react"
import { LinkButton } from "@/components/dashboard/link-button"
import type { MarketplaceProduct, DetectedOpportunitySignal } from "@/lib/intelligence/types"

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const [matchMessage, setMatchMessage] = useState<string | null>(null)

  const [statusMap, setStatusMap] = useState<ScanStatusMap>({
    amazon: "WAITING",
    flipkart: "WAITING",
    myntra: "WAITING",
  })

  // Dynamic state populated directly from POST /api/compare (Initialized un-scanned)
  const [productName, setProductName] = useState("Ready to scan markets")
  const [brand, setBrand] = useState("ShelfGuard AI")

  const [amazonOffer, setAmazonOffer] = useState<MarketplaceProduct>({
    marketplace: "amazon",
    productName: "Ready to scan",
    brand: "Amazon",
    productId: "AMZ-UNSCANNED",
    price: 0,
    originalPrice: 0,
    currency: "INR",
    stockStatus: "out_of_stock",
    productUrl: "https://www.amazon.in",
    lastChecked: new Date().toISOString(),
    isLive: false,
  })

  const [flipkartOffer, setFlipkartOffer] = useState<MarketplaceProduct>({
    marketplace: "flipkart",
    productName: "Ready to scan",
    brand: "Flipkart",
    productId: "FK-UNSCANNED",
    price: 0,
    originalPrice: 0,
    currency: "INR",
    stockStatus: "out_of_stock",
    productUrl: "https://www.flipkart.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  })

  const [myntraOffer, setMyntraOffer] = useState<MarketplaceProduct>({
    marketplace: "myntra",
    productName: "Ready to scan",
    brand: "Myntra",
    productId: "MYNTRA-UNSCANNED",
    price: 0,
    originalPrice: 0,
    currency: "INR",
    stockStatus: "out_of_stock",
    productUrl: "https://www.myntra.com",
    lastChecked: new Date().toISOString(),
    isLive: false,
  })

  const [opportunities, setOpportunities] = useState<DetectedOpportunitySignal[]>([])

  // Dynamic calculations strictly from LIVE offers (isLive === true & price > 0)
  const offersList = [amazonOffer, flipkartOffer, myntraOffer]
  const liveOffers = offersList.filter((o) => o && o.isLive === true && o.price > 0)

  const lowestOffer = liveOffers.length
    ? liveOffers.reduce((prev, curr) => (curr.price < prev.price ? curr : prev))
    : null

  const highestOffer = liveOffers.length
    ? liveOffers.reduce((prev, curr) => (curr.price > prev.price ? curr : prev))
    : null

  const gapAmount = lowestOffer && highestOffer ? highestOffer.price - lowestOffer.price : 0
  const cheapestMarketplace = lowestOffer ? lowestOffer.marketplace : "amazon"
  const gapPercentage =
    lowestOffer && lowestOffer.price > 0
      ? Number(((gapAmount / lowestOffer.price) * 100).toFixed(1))
      : 0

  async function handleScanMarket(urls: {
    amazonUrl: string
    flipkartUrl: string
    myntraUrl: string
  }) {
    // 1. CLEAR OLD PRODUCT DATA IMMEDIATELY
    setLoading(true)
    setHasScanned(true)
    setMatchMessage(null)
    setProductName("Scanning listing...")
    setBrand("Extracting live data...")

    setAmazonOffer({
      marketplace: "amazon",
      productName: "Scanning...",
      brand: "Amazon",
      productId: "AMZ-SCANNING",
      price: 0,
      originalPrice: 0,
      currency: "INR",
      stockStatus: "out_of_stock",
      productUrl: urls.amazonUrl || "https://www.amazon.in",
      lastChecked: new Date().toISOString(),
      isLive: false,
    })

    setFlipkartOffer({
      marketplace: "flipkart",
      productName: "Scanning...",
      brand: "Flipkart",
      productId: "FK-SCANNING",
      price: 0,
      originalPrice: 0,
      currency: "INR",
      stockStatus: "out_of_stock",
      productUrl: urls.flipkartUrl || "https://www.flipkart.com",
      lastChecked: new Date().toISOString(),
      isLive: false,
    })

    setMyntraOffer({
      marketplace: "myntra",
      productName: "Scanning...",
      brand: "Myntra",
      productId: "MYNTRA-SCANNING",
      price: 0,
      originalPrice: 0,
      currency: "INR",
      stockStatus: "out_of_stock",
      productUrl: urls.myntraUrl || "https://www.myntra.com",
      lastChecked: new Date().toISOString(),
      isLive: false,
    })

    setOpportunities([])

    setStatusMap({
      amazon: urls.amazonUrl ? "SCANNING" : "WAITING",
      flipkart: urls.flipkartUrl ? "SCANNING" : "WAITING",
      myntra: urls.myntraUrl ? "SCANNING" : "WAITING",
    })

    try {
      // 2. FETCH FROM SERVER ROUTE
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urls),
      })

      const data = await res.json()

      if (data.success) {
        // 3. REPLACE STATE STRICTLY WITH API RESPONSE
        if (data.productName && data.productName !== "Marketplace Listing") {
          setProductName(data.productName)
        }
        if (data.brand && data.brand !== "Brand") {
          setBrand(data.brand)
        }

        if (data.amazon) setAmazonOffer(data.amazon)
        if (data.flipkart) setFlipkartOffer(data.flipkart)
        if (data.myntra) setMyntraOffer(data.myntra)

        if (Array.isArray(data.opportunities)) {
          setOpportunities(data.opportunities)
        }

        if (data.productsMatch === false) {
          setMatchMessage(data.matchMessage || "Products don't appear to match")
        }

        // Status map update
        setStatusMap({
          amazon: data.amazon?.isLive && data.amazon?.price > 0 ? "LIVE" : urls.amazonUrl ? "UNABLE TO RETRIEVE" : "NOT PROVIDED",
          flipkart: data.flipkart?.isLive && data.flipkart?.price > 0 ? "LIVE" : urls.flipkartUrl ? "UNABLE TO RETRIEVE" : "NOT PROVIDED",
          myntra: data.myntra?.isLive && data.myntra?.price > 0 ? "LIVE" : urls.myntraUrl ? "UNABLE TO RETRIEVE" : "NOT PROVIDED",
        })
      }
    } catch (err) {
      console.error("Scan error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 page-enter">
      {/* 1. Header & Market Pulse Hero */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="space-y-4">
          <CommandHero />

          {/* Focal Point Callout Banner */}
          <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/10 via-card to-card p-5 shadow-xl hairline space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold animate-pulse" />
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                LIVE MARKET SIGNAL
              </span>
            </div>

            {matchMessage ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-400">
                <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                <p className="text-xs font-semibold">{matchMessage}</p>
              </div>
            ) : liveOffers.length >= 2 && gapAmount === 0 ? (
              <>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  EQUAL PRICING — ₹{lowestOffer?.price.toLocaleString("en-IN")} ACROSS {liveOffers.length === 3 ? "AMAZON, FLIPKART AND MYNTRA" : `${liveOffers.length} MARKETPLACES`}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Equal prices detected across all active live channels. No price spread gap.
                </p>
              </>
            ) : liveOffers.length >= 2 && gapAmount > 0 ? (
              <>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {cheapestMarketplace.toUpperCase()} IS CURRENTLY ₹{gapAmount.toLocaleString("en-IN")} CHEAPER
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  <span className="text-gold font-bold">{gapPercentage}% price gap</span> across {liveOffers.length} live channels
                </p>
              </>
            ) : liveOffers.length === 1 ? (
              <>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {liveOffers[0].marketplace.toUpperCase()} IS ACTIVE — ₹{liveOffers[0].price.toLocaleString("en-IN")}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Single live channel active. Waiting for another live marketplace URL response.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Ready to scan your markets
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Paste product URLs below and click &quot;SCAN ALL MARKETS&quot; to extract live data from Bright Data.
                </p>
              </>
            )}
          </div>
        </div>

        {/* 3-Marketplace Radar Visualization */}
        <div className="flex items-center justify-center">
          <MarketRadar
            amazonPrice={amazonOffer.isLive ? amazonOffer.price : 0}
            flipkartPrice={flipkartOffer.isLive ? flipkartOffer.price : 0}
            myntraPrice={myntraOffer.isLive ? myntraOffer.price : 0}
            isAmazonLive={amazonOffer.isLive}
            isFlipkartLive={flipkartOffer.isLive}
            isMyntraLive={myntraOffer.isLive}
          />
        </div>
      </div>

      {/* 2. Interactive Market Scan Bar */}
      <ProductUrlInput onScan={handleScanMarket} loading={loading} statusMap={statusMap} />

      {/* Loading Overlay State */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/5 p-6 text-gold animate-pulse">
          <Loader2 className="size-6 animate-spin shrink-0 text-gold" />
          <div className="space-y-1">
            <p className="text-sm font-bold uppercase tracking-wider">SCANNING LIVE MARKETS...</p>
            <p className="text-xs text-muted-foreground">
              Extracting product parameters directly from Bright Data for Amazon, Flipkart, and Myntra...
            </p>
          </div>
        </div>
      ) : null}

      {/* 3. Dynamic Product Identity & Marketplace Cards */}
      {!loading ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-gold uppercase">Tracked Listing</span>
              <h3 className="font-heading text-xl font-bold text-foreground">
                {hasScanned || liveOffers.length ? productName : "Ready to scan markets"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Brand: <span className="text-foreground font-semibold">{brand}</span> · Monitored across 3 Target Retailers ({liveOffers.length} Live)
              </p>
            </div>
            <LinkButton variant="outline" size="sm" href="/products" className="text-xs">
              Catalog View <ArrowRight className="ml-1 size-3" />
            </LinkButton>
          </div>

          {/* 3 Marketplace Price Stations Grid */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_1fr] items-center">
            <MarketplacePriceCard
              marketplace="Amazon"
              price={amazonOffer.isLive ? amazonOffer.price : 0}
              originalPrice={amazonOffer.originalPrice}
              stockStatus={amazonOffer.stockStatus}
              isLive={amazonOffer.isLive}
              hasUrl={Boolean(amazonOffer.productUrl && amazonOffer.productUrl.length > 10)}
              isCheapest={cheapestMarketplace === "amazon" && amazonOffer.isLive}
            />

            <PriceGap
              liveCount={liveOffers.length}
              gapAmount={gapAmount}
              gapPercentage={gapPercentage}
              cheapestMarketplace={cheapestMarketplace}
              equalPrice={lowestOffer ? lowestOffer.price : 0}
            />

            <MarketplacePriceCard
              marketplace="Flipkart"
              price={flipkartOffer.isLive ? flipkartOffer.price : 0}
              originalPrice={flipkartOffer.originalPrice}
              stockStatus={flipkartOffer.stockStatus}
              isLive={flipkartOffer.isLive}
              hasUrl={Boolean(flipkartOffer.productUrl && flipkartOffer.productUrl.length > 10)}
              isCheapest={cheapestMarketplace === "flipkart" && flipkartOffer.isLive}
            />

            <MarketplacePriceCard
              marketplace="Myntra"
              price={myntraOffer.isLive ? myntraOffer.price : 0}
              originalPrice={myntraOffer.originalPrice}
              stockStatus={myntraOffer.stockStatus}
              isLive={myntraOffer.isLive}
              hasUrl={Boolean(myntraOffer.productUrl && myntraOffer.productUrl.length > 10)}
              isCheapest={cheapestMarketplace === "myntra" && myntraOffer.isLive}
            />

          </div>
        </div>
      ) : null}

      {/* 4. Decision Intelligence Panel */}
      {!loading && liveOffers.length >= 1 ? (
        <RecommendationPanel
          opportunities={opportunities as unknown as Array<{
            id: string
            title: string
            description: string
            evidence: string
            recommendedAction: string
            severity: "critical" | "high" | "medium" | "low"
            score: number
            marketplace: string
          }>}
          cheapestMarketplace={cheapestMarketplace}
          gapAmount={gapAmount}
          amazonPrice={amazonOffer.isLive ? amazonOffer.price : 0}
          flipkartPrice={flipkartOffer.isLive ? flipkartOffer.price : 0}
        />
      ) : null}

      {/* 5. Historical Price Trajectory */}
      {!loading && liveOffers.length >= 1 ? (
        <PriceTrajectory
          amazonCurrent={amazonOffer.isLive ? amazonOffer.price : 3999}
          flipkartCurrent={flipkartOffer.isLive ? flipkartOffer.price : 8990}
        />
      ) : null}
    </div>
  )
}
