"use client"

import type { ChangeEvent } from "react"
import { useState } from "react"
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, RefreshCw, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MonitorPill, StockPill } from "@/components/dashboard/status-pills"
import { formatMoney } from "@/lib/format"
import type { Product } from "@/lib/mock/types"

export function LiveProductManager({
  onLiveProductLoaded,
}: {
  onLiveProductLoaded?: (product: Product | null) => void
}) {
  const [url, setUrl] = useState("https://www.amazon.in/dp/B0DG2SLR9F")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<"live_brightdata" | "mock_fallback" | null>(null)
  const [snapshotId, setSnapshotId] = useState<string | null>(null)
  const [liveProduct, setLiveProduct] = useState<Product | null>(null)

  async function handleScrape() {
    if (!url.trim()) {
      setError("Please enter a valid product URL.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to extract product data from Bright Data.")
      }

      setSource(data.source)
      setSnapshotId(data.snapshotId || null)

      if (Array.isArray(data.data) && data.data.length > 0) {
        const prod = data.data[0] as Product
        setLiveProduct(prod)
        if (onLiveProductLoaded) {
          onLiveProductLoaded(prod)
        }
      } else {
        throw new Error("No extracted product records returned.")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setSource("mock_fallback")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-gold/30 bg-card/90 shadow-xl hairline">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-teal/10 blur-3xl"
        aria-hidden
      />

      <CardHeader className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {source === "live_brightdata" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-bold tracking-wider text-teal uppercase shadow-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-2 animate-ping rounded-full bg-teal opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal" />
                </span>
                LIVE DATA
              </span>
            ) : source === "mock_fallback" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold tracking-wider text-gold uppercase shadow-sm">
                <Zap className="size-3 text-gold" />
                DEMO FALLBACK
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <Sparkles className="size-3 text-gold" />
                Bright Data Collector Console
              </span>
            )}

            {snapshotId ? (
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border/60">
                Snapshot: {snapshotId}
              </Badge>
            ) : null}
          </div>

          <Button
            size="sm"
            onClick={handleScrape}
            disabled={loading}
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Extracting Live Data...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Refresh Live Data
              </>
            )}
          </Button>
        </div>

        <div>
          <CardTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
            Live Marketplace Extraction (Bright Data Scraper Studio)
          </CardTitle>
          <CardDescription className="text-xs">
            Trigger server-side extraction for any Indian marketplace product URL to stream live PDP attributes into your intelligence dashboard.
          </CardDescription>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="Enter Amazon / Marketplace product URL..."
              disabled={loading}
              className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleScrape}
            disabled={loading}
            className="shrink-0 text-xs font-semibold"
          >
            {loading ? "Scraping..." : "Scrape PDP"}
          </Button>
        </div>
      </CardHeader>


      {/* Loading State Overlay */}
      {loading ? (
        <CardContent className="relative z-10 border-t border-border/60 pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-teal/30 bg-teal/5 p-4 text-teal">
            <Loader2 className="size-5 animate-spin shrink-0 text-teal" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">Bright Data Collector Active</p>
              <p className="text-[11px] text-muted-foreground">
                Polling Scraper Studio collector <code className="font-mono text-teal">c_mt4maubd1v7q5h4l1e</code> for live product parameters...
              </p>
            </div>
          </div>
        </CardContent>
      ) : null}

      {/* Error State */}
      {error && !loading ? (
        <CardContent className="relative z-10 border-t border-border/60 pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-signal/40 bg-signal/10 p-4 text-signal">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">Extraction Warning / Fallback Active</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{error}</p>
            </div>
          </div>
        </CardContent>
      ) : null}

      {/* Live Extracted Product Result Display */}
      {liveProduct && !loading ? (
        <CardContent className="relative z-10 border-t border-border/60 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-teal uppercase flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-teal" />
              Live Extracted SKU Result
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Last checked: {new Date(liveProduct.lastChecked).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid gap-4 rounded-xl border border-teal/30 bg-card p-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-teal/30 text-teal bg-teal/5">
                  {liveProduct.category}
                </Badge>
                <MonitorPill status={liveProduct.monitorStatus} />
                <StockPill status={liveProduct.stockStatus} />
                <span className="font-mono text-xs text-muted-foreground">{liveProduct.sku}</span>
              </div>

              <h4 className="font-heading text-base font-bold tracking-tight text-foreground line-clamp-2">
                {liveProduct.name}
              </h4>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <p>
                  Seller / Brand: <span className="font-semibold text-foreground capitalize">{liveProduct.competitor}</span>
                </p>
                {liveProduct.url ? (
                  <a
                    href={liveProduct.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-teal hover:underline font-medium"
                  >
                    View Product Page <ExternalLink className="ml-1 size-3" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase text-left sm:text-right">
                  Live Price
                </p>
                <p className="font-mono text-xl font-bold tabular-nums text-teal">
                  {formatMoney(liveProduct.currentPrice)}
                </p>
              </div>

              {liveProduct.previousPrice > 0 && liveProduct.previousPrice !== liveProduct.currentPrice ? (
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Original</p>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground line-through">
                    {formatMoney(liveProduct.previousPrice)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
