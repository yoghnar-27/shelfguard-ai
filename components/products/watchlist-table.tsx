"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { EmptyState } from "@/components/dashboard/empty-state"
import { MonitorPill, StockPill } from "@/components/dashboard/status-pills"
import { formatDelta, formatMoney, formatRelative } from "@/lib/format"
import { DEMO_NOW, products } from "@/lib/mock"
import { cn } from "@/lib/utils"

export function WatchlistTable() {
  const [query, setQuery] = useState("")
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.competitor.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="space-y-4">
      <label className="relative block max-w-md">
        <span className="sr-only">Search watchlist</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product, competitor, SKU"
          className="h-9 w-full rounded-lg border border-input bg-input/30 pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {rows.length === 0 ? (
        <EmptyState
          title="No monitored products match"
          description="Try another competitor or SKU. Demo catalog is drinkware and accessories only."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[860px] text-left text-sm">
            <caption className="sr-only">Competitor product watchlist</caption>
            <thead className="bg-muted/30 text-[11px] tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Competitor</th>
                <th className="px-4 py-3 font-medium">Current</th>
                <th className="px-4 py-3 font-medium">Previous</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Last checked</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => {
                const delta = formatDelta(product.currentPrice, product.previousPrice)
                return (
                  <tr key={product.id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link href={`/products/${product.id}`} className="font-medium hover:text-gold">
                        {product.name}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">{product.sku}</p>
                    </td>
                    <td className="px-4 py-3">{product.competitor}</td>
                    <td className="px-4 py-3 tabular-nums">{formatMoney(product.currentPrice)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {formatMoney(product.previousPrice)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 tabular-nums",
                        delta.direction === "down" && "text-teal",
                        delta.direction === "up" && "text-signal",
                        delta.direction === "flat" && "text-muted-foreground"
                      )}
                    >
                      {delta.direction === "flat" ? "—" : delta.label}
                    </td>
                    <td className="px-4 py-3">
                      <StockPill status={product.stockStatus} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelative(product.lastChecked, DEMO_NOW)}
                    </td>
                    <td className="px-4 py-3">
                      <MonitorPill status={product.monitorStatus} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
