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
import { cn } from "@/lib/utils"

export function ProductIntelligence({ id }: { id: string }) {
  const product = getProduct(id)
  if (!product) {
    return (
      <ErrorState
        title="Product not in demo catalog"
        description="This ID is not part of the Phase 1 mock set. Return to Products and pick a tracked SKU."
      />
    )
  }

  const history = getPriceHistory(product.id)
  const stock = getStockHistory(product.id)
  const detected = getProductChanges(product.id)
  const opps = getProductOpportunities(product.id)
  const comps = getCompetitorsFor(product)
  const delta = formatDelta(product.currentPrice, product.previousPrice)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="hairline">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              <MonitorPill status={product.monitorStatus} />
              <StockPill status={product.stockStatus} />
            </div>
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <CardDescription>
              {product.competitor} · {product.sku} · last extract {formatDateTime(product.lastChecked)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Current price</p>
              <p className="mt-1 font-heading text-2xl tabular-nums">
                {formatMoney(product.currentPrice)}
              </p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Change</p>
              <p
                className={cn(
                  "mt-1 text-lg tabular-nums",
                  delta.direction === "down" && "text-teal",
                  delta.direction === "up" && "text-signal"
                )}
              >
                {delta.direction === "flat" ? "Unchanged" : delta.label}
              </p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Variants</p>
              <p className="mt-1 text-sm">{product.variants.join(" · ")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Opportunity indicators</CardTitle>
            <CardDescription>
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
