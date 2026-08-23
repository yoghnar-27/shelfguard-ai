"use client"

import type { ChangeEvent } from "react"
import { useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StockPill } from "@/components/dashboard/status-pills"
import { formatMoney } from "@/lib/format"
import type { CompetitiveComparison, MarketplaceProduct } from "@/lib/intelligence/types"

export function LiveComparisonManager() {
  const [amazonUrl, setAmazonUrl] = useState("https://www.amazon.in/dp/B0DG2SLR9F")
  const [flipkartUrl, setFlipkartUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [result, setResult] = useState<{
    amazon: MarketplaceProduct
    flipkart: MarketplaceProduct
    comparison: CompetitiveComparison["priceSummary"] & { priceDifference?: number }
    stockSummary: CompetitiveComparison["stockSummary"]
    opportunities: CompetitiveComparison["opportunities"]
  } | null>(null)


  async function handleCompare() {
    if (!amazonUrl.trim()) {
      setError("Please enter a valid Amazon product URL.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amazonUrl: amazonUrl.trim(),
          flipkartUrl: flipkartUrl.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute marketplace comparison.")
      }

      setResult({
        amazon: data.amazon,
        flipkart: data.flipkart,
        comparison: data.comparison,
        stockSummary: data.comparison.stockSummary,
        opportunities: data.opportunities || [],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-gold/40 bg-card/95 shadow-xl hairline">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />

      <CardHeader className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold tracking-wider text-gold uppercase shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              Live Multi-Marketplace Comparison
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleCompare}
            disabled={loading}
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Comparing Live Prices...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Compare Competitors
              </>
            )}
          </Button>
        </div>

        <div>
          <CardTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
            Amazon vs. Flipkart Real-Time Price Comparison
          </CardTitle>
          <CardDescription className="text-xs">
            Compare prices, inventory status, and price spread directly between Amazon and Flipkart.
          </CardDescription>
        </div>

        {/* Input Controls */}
        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1 block">
              Amazon Product URL
            </label>
            <input
              type="text"
              value={amazonUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmazonUrl(e.target.value)}
              placeholder="Enter Amazon URL..."
              disabled={loading}
              className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1 block">
              Flipkart Product URL
            </label>
            <input
              type="text"
              value={flipkartUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFlipkartUrl(e.target.value)}
              placeholder="Enter Flipkart URL..."
              disabled={loading}
              className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
            />
          </div>
        </div>
      </CardHeader>

      {/* Loading Overlay */}
      {loading ? (
        <CardContent className="relative z-10 border-t border-border/60 pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4 text-gold">
            <Loader2 className="size-5 animate-spin shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">Comparing Live Marketplaces...</p>
              <p className="text-[11px] text-muted-foreground">
                Extracting current PDP parameters from Amazon and Flipkart...
              </p>
            </div>
          </div>
        </CardContent>
      ) : null}

      {/* Error Message */}
      {error && !loading ? (
        <CardContent className="relative z-10 border-t border-border/60 pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-signal/40 bg-signal/10 p-4 text-signal">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">Comparison Notice</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{error}</p>
            </div>
          </div>
        </CardContent>
      ) : null}

      {/* Comparison Results */}
      {result && !loading ? (
        <CardContent className="relative z-10 border-t border-border/60 pt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-widest text-gold uppercase flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-gold" />
              Live Comparison Result
            </span>

            {result.comparison.priceSpreadPercentage > 0 ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 text-[10px] font-bold text-teal uppercase">
                  Cheapest: {result.comparison.cheapestMarketplace.toUpperCase()}
                </span>
                <span className="rounded-full border border-signal/40 bg-signal/10 px-2.5 py-0.5 text-[10px] font-bold text-signal uppercase">
                  Spread: {result.comparison.priceSpreadPercentage}% (₹{(result.comparison.priceDifference ?? result.comparison.priceSpread ?? 0).toLocaleString()})
                </span>

              </div>
            ) : (
              <span className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                Single Channel Active
              </span>
            )}
          </div>

          {/* Cards Side-by-Side */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Amazon Card */}
            <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold text-foreground">Amazon India</span>
                {result.amazon.isLive && result.amazon.price > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal uppercase">
                    <span className="size-1.5 rounded-full bg-teal animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                    <Zap className="size-3 text-muted-foreground" />
                    NOT CONNECTED
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-foreground line-clamp-1">
                {result.amazon.isLive ? result.amazon.productName : "Amazon Listing"}
              </p>

              <div className="flex items-baseline justify-between pt-1 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Price</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {result.amazon.isLive && result.amazon.price > 0 ? formatMoney(result.amazon.price) : "—"}
                  </p>
                </div>
                {result.amazon.isLive ? <StockPill status={result.amazon.stockStatus} /> : null}
              </div>
            </div>

            {/* Flipkart Card */}
            <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold text-foreground">Flipkart</span>
                {result.flipkart.isLive && result.flipkart.price > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal uppercase">
                    <span className="size-1.5 rounded-full bg-teal animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                    <Zap className="size-3 text-muted-foreground" />
                    NOT CONNECTED
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-foreground line-clamp-1">
                {result.flipkart.isLive ? result.flipkart.productName : "Not Connected"}
              </p>

              <div className="flex items-baseline justify-between pt-1 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Price</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {result.flipkart.isLive && result.flipkart.price > 0 ? formatMoney(result.flipkart.price) : "—"}
                  </p>
                </div>
                {result.flipkart.isLive ? <StockPill status={result.flipkart.stockStatus} /> : null}
              </div>
            </div>
          </div>

          {/* Detected Opportunities Banner */}
          {result.opportunities.length ? (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 space-y-2">
              <p className="text-[10px] font-bold tracking-wider text-gold uppercase flex items-center gap-1">
                <Sparkles className="size-3" /> Detected Opportunities ({result.opportunities.length})
              </p>
              {result.opportunities.map((opp) => (
                <div key={opp.id} className="text-xs flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{opp.title}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{opp.recommendedAction}</span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}
