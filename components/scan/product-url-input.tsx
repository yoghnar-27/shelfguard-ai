"use client"

import type { ChangeEvent } from "react"
import { useState } from "react"
import { CheckCircle2, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ScanStatusMap = Record<
  "amazon" | "flipkart" | "myntra",
  "WAITING" | "SCANNING" | "LIVE" | "UNABLE TO RETRIEVE" | "NOT PROVIDED"
>

export function ProductUrlInput({
  onScan,
  loading = false,
  statusMap,
}: {
  onScan: (urls: {
    amazonUrl: string
    flipkartUrl: string
    myntraUrl: string
  }) => void
  loading?: boolean
  statusMap?: ScanStatusMap
}) {
  const [amazonUrl, setAmazonUrl] = useState("https://amzn.in/d/0bOhQFBi")
  const [flipkartUrl, setFlipkartUrl] = useState("https://www.flipkart.com/boat-rockerz-551-anc-pro-2025-launch-42db-anc-72hrs-battery-app-support-bluetooth/p/itmea53b35bf6e5f")
  const [myntraUrl, setMyntraUrl] = useState("https://www.myntra.com/dresses/dressberry/dressberry-pink-floral-printed-puff-sleeves-square-neck-maxi-dress/24000348/buy")

  const isAmazonDetected = amazonUrl.toLowerCase().includes("amazon") || amazonUrl.toLowerCase().includes("amzn.in")
  const isFlipkartDetected = flipkartUrl.toLowerCase().includes("flipkart")
  const isMyntraDetected = myntraUrl.toLowerCase().includes("myntra")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onScan({
      amazonUrl: amazonUrl.trim(),
      flipkartUrl: flipkartUrl.trim(),
      myntraUrl: myntraUrl.trim(),
    })
  }

  function renderBadge(detected: boolean, status?: string) {
    if (status && status !== "WAITING") {
      if (status === "SCANNING") {
        return (
          <span className="text-gold font-mono font-bold text-[10px] animate-pulse">
            SCANNING...
          </span>
        )
      }
      if (status === "LIVE") {
        return (
          <span className="text-gold font-semibold text-[10px] flex items-center gap-1">
            <CheckCircle2 className="size-3 text-gold" /> LIVE ✓
          </span>
        )
      }
      if (status === "UNABLE TO RETRIEVE") {
        return (
          <span className="text-muted-foreground font-semibold text-[10px]">
            UNABLE TO RETRIEVE
          </span>
        )
      }
      if (status === "NOT PROVIDED") {
        return (
          <span className="text-muted-foreground font-semibold text-[10px]">
            NOT PROVIDED
          </span>
        )
      }
    }
    if (detected) {
      return (
        <span className="text-gold font-semibold text-[10px] flex items-center gap-1">
          <CheckCircle2 className="size-3" /> DETECTED ✓
        </span>
      )
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gold/30 bg-card/90 p-5 shadow-2xl hairline space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">Scan Target Retailers</h3>
          <p className="text-xs text-muted-foreground">
            Paste product listing URLs for Amazon, Flipkart, or Myntra to extract live multi-channel market intelligence.
          </p>
        </div>
        <Button type="submit" disabled={loading} className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold shadow-md">
          {loading ? (
            <>
              <RefreshCw className="mr-2 size-4 animate-spin" />
              SCANNING LIVE MARKETS...
            </>
          ) : (
            <>
              <Search className="mr-2 size-4" />
              SCAN ALL MARKETS
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Amazon */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Amazon URL</span>
            {renderBadge(isAmazonDetected, statusMap?.amazon)}
          </div>
          <input
            type="text"
            value={amazonUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmazonUrl(e.target.value)}
            placeholder="Paste Amazon link..."
            disabled={loading}
            className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
          />
        </div>

        {/* Flipkart */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Flipkart URL</span>
            {renderBadge(isFlipkartDetected, statusMap?.flipkart)}
          </div>
          <input
            type="text"
            value={flipkartUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFlipkartUrl(e.target.value)}
            placeholder="Paste Flipkart link..."
            disabled={loading}
            className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
          />
        </div>

        {/* Myntra */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Myntra URL</span>
            {renderBadge(isMyntraDetected, statusMap?.myntra)}
          </div>
          <input
            type="text"
            value={myntraUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMyntraUrl(e.target.value)}
            placeholder="Paste Myntra link..."
            disabled={loading}
            className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
          />
        </div>
      </div>
    </form>
  )
}
