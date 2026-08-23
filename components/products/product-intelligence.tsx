import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/dashboard/link-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PriceAreaChart } from "@/components/dashboard/charts"
import { ErrorState } from "@/components/dashboard/empty-state"
import { MonitorPill, StockPill } from "@/components/dashboard/status-pills"
import { OpportunityCard } from "@/components/opportunities/opportunity-card"
import { formatDateTime, formatDelta, formatMoney, stockLabel } from "@/lib/format"
import {
  getCompetitorsFor,
  getPriceHistory,
  getProduct,
  getProductChanges,
  getProductOpportunities,
  getStockHistory,
} from "@/lib/mock"
import { generateCompetitiveIntelligence } from "@/lib/intelligence"
import { cn } from "@/lib/utils"
import { ExternalLink, Sparkles, Zap } from "lucide-react"

export function ProductIntelligence({ id }: { id: string }) {
  let product = getProduct(id)

  if (!product && (id.startsWith("p-live-") || id.startsWith("B0"))) {
    product = {
      id,
      name: "Amazon Basics Pro Series Wireless Noise Cancelling ANC Over Ear Headphone",
      sku: `ASIN: ${id}`,
      competitor: "amazon basics",
      competitorId: "comp-amazon",
      category: "Electronics",
      url: "https://www.amazon.in/dp/B0DG2SLR9F",
      currentPrice: 1999,
      previousPrice: 3499,
      currency: "INR",
      stockStatus: "in_stock",
      stockUnits: null,
      lastChecked: new Date().toISOString(),
      monitorStatus: "watching",
      variants: ["Noise Cancelling", "Over Ear", "Wireless"],
      imageTone: "from-amber-950/60 to-slate-900",
    }
  }

  if (!product) {
    return (
      <ErrorState
        title="Product not in catalog"
        description="This ID is not part of the current catalog or live extraction window. Return to Products to view tracked SKUs."
      />
    )
  }

  const history = getPriceHistory(product.id)
  const stock = getStockHistory(product.id)
  const detected = getProductChanges(product.id)
  const opps = getProductOpportunities(product.id)
  const comps = getCompetitorsFor(product)
  const delta = formatDelta(product.currentPrice, product.previousPrice)

  // Generate Multi-Retailer Competitive Intelligence
  const intelligence = generateCompetitiveIntelligence(product)

  return (
    <div className="space-y-6 page-enter">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="hairline">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              <MonitorPill status={product.monitorStatus} />
              <StockPill status={product.stockStatus} />
            </div>
            <CardTitle className="text-xl font-heading font-bold text-foreground">{product.name}</CardTitle>
            <CardDescription className="text-xs">
              {product.competitor} · {product.sku} · last extract {formatDateTime(product.lastChecked)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Current price</p>
              <p className="mt-1 font-heading text-2xl tabular-nums font-bold text-foreground">
                {formatMoney(product.currentPrice)}
              </p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Change</p>
              <p
                className={cn(
                  "mt-1 text-lg tabular-nums font-semibold",
                  delta.direction === "down" && "text-teal",
                  delta.direction === "up" && "text-signal"
                )}
              >
                {delta.direction === "flat" ? "Unchanged" : delta.label}
              </p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Variants</p>
              <p className="mt-1 text-sm font-medium">{product.variants.join(" · ")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Opportunity indicators</CardTitle>
            <CardDescription className="text-xs">
              {opps.length ? `${opps.length} live demo opportunity(s)` : "No material opportunity on this SKU"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {opps.length ? (
              opps.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)
            ) : (
              <p className="text-sm text-muted-foreground">
                Watch for stock flips or price moves above the 2% material threshold.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Multi-Retailer Marketplace Comparison Table */}
      <Card className="hairline border-gold/30 bg-card/90">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Sparkles className="size-4 text-gold" />
                Cross-Marketplace Price & Stock Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time price spread across Amazon, Flipkart & Myntra.


              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 text-[10px] font-bold text-teal uppercase">
                Spread: {intelligence.priceSummary.priceSpreadPercentage}%
              </span>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-gold uppercase">
                Cheapest: {intelligence.priceSummary.cheapestMarketplace.toUpperCase()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto space-y-4">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-muted/30 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              <tr className="border-b border-border/70">
                <th className="px-4 py-3 font-medium">Marketplace</th>
                <th className="px-4 py-3 font-medium">Data Status</th>
                <th className="px-4 py-3 font-medium">Price (INR)</th>
                <th className="px-4 py-3 font-medium">Price Variance</th>
                <th className="px-4 py-3 font-medium">Stock Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {intelligence.offers.map((offer) => {
                const isCheapest = offer.marketplace === intelligence.priceSummary.cheapestMarketplace
                const variance = offer.price - intelligence.priceSummary.lowestPrice
                const variancePct =
                  intelligence.priceSummary.lowestPrice > 0
                    ? Number(((variance / intelligence.priceSummary.lowestPrice) * 100).toFixed(1))
                    : 0

                return (
                  <tr key={offer.marketplace} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-heading font-semibold text-foreground capitalize">
                      {offer.marketplace}
                    </td>
                    <td className="px-4 py-3">
                      {offer.isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal uppercase">
                          <span className="size-1.5 rounded-full bg-teal animate-pulse" />
                          LIVE (BRIGHT DATA)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                          <Zap className="size-3 text-gold" />
                          DEMO / UNCONNECTED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold tabular-nums text-foreground">
                      {formatMoney(offer.price)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">
                      {isCheapest ? (
                        <span className="text-teal font-bold">Lowest Price</span>
                      ) : (
                        <span className="text-signal">+{variancePct}% (+₹{variance.toLocaleString()})</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockPill status={offer.stockStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {offer.productUrl && offer.productUrl !== "#" ? (
                        <a
                          href={offer.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-gold hover:underline font-medium"
                        >
                          PDP Link <ExternalLink className="ml-1 size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>

        <CardHeader>
          <CardTitle>Historical price</CardTitle>
          <CardDescription>Mock extract history for this product page.</CardDescription>
        </CardHeader>
        <CardContent>
          <PriceAreaChart data={history} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock history</CardTitle>
            <CardDescription>Availability over the last collections.</CardDescription>
          </CardHeader>
          <CardContent>
            {stock.length ? (
              <ol className="space-y-2">
                {stock.map((point) => (
                  <li
                    key={point.date}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"
                  >
                    <span>{point.date}</span>
                    <span className="text-muted-foreground">
                      {stockLabel(point.status)}
                      {point.units != null ? ` · ${point.units} units` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                No extended stock series in the demo set for this SKU. Current status:{" "}
                {stockLabel(product.stockStatus)}.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Detected changes</CardTitle>
            <CardDescription>Material vs noise on this product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {detected.length ? (
              detected.map((change) => (
                <div key={change.id} className="rounded-lg border border-border/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{change.summary}</p>
                    <Badge variant={change.material ? "default" : "outline"}>
                      {change.material ? "Material" : "Noise"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{change.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No classified changes in the demo window.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitor comparison</CardTitle>
          <CardDescription>Other watched SKUs in {product.category}.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {comps.length ? (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Seller</th>
                  <th className="py-2 pr-3 font-medium">Price</th>
                  <th className="py-2 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="py-2 pr-3">
                      <Link href={`/products/${item.id}`} className="hover:text-gold">
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{item.competitor}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatMoney(item.currentPrice)}</td>
                    <td className="py-2">
                      <StockPill status={item.stockStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No category peers in the demo catalog.</p>
          )}
          <div className="mt-4">
            <LinkButton variant="outline" size="sm" href="/watchlist">
              Back to watchlist
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
