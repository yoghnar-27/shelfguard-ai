import Link from "next/link"
import { ArrowRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MonitorPill, StockPill } from "@/components/dashboard/status-pills"
import { formatDelta, formatMoney } from "@/lib/format"
import { products } from "@/lib/mock"
import type { Product } from "@/lib/mock/types"
import { cn } from "@/lib/utils"


const marketSignals: Record<string, string> = {
  "p-growler-1": "Price Undercut -12%",
  "p-growler-2": "Stockout Risk Detected",
  "p-tumbler-1": "Category Best Seller",
  "p-tumbler-2": "Variant Price Shift",
  "p-bottle-1": "Stable Margin Lead",
  "p-bottle-2": "Competitor Restocked",
}

export function ProductGrid({ liveProduct }: { liveProduct?: Product | null }) {
  const displayProducts = liveProduct ? [liveProduct, ...products] : products

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 page-enter">
      {displayProducts.map((product) => {
        const delta = formatDelta(product.currentPrice, product.previousPrice)
        const signal = marketSignals[product.id] || (product.id.startsWith("p-live-") ? "Live Scraped Item" : "Market Signal Active")


        return (
          <li key={product.id}>
            <Link href={`/products/${product.id}`} className="group block h-full">
              <Card className="card-hover hairline relative overflow-hidden h-full border-border/80 bg-card/90 hover:border-gold/40 hover:shadow-xl transition-all duration-300">
                <CardContent className="space-y-4 p-4">
                  {/* Image container with smooth scaling */}
                  <div className="relative h-32 rounded-xl overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-110",
                        product.imageTone
                      )}
                      aria-hidden
                    />
                    
                    <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/90 uppercase tracking-wider backdrop-blur-md">
                          {product.category}
                        </span>
                        <MonitorPill status={product.monitorStatus} />
                      </div>

                      <div className="flex items-end justify-between">
                        <p className="font-mono text-xs font-semibold text-white/90">{product.sku}</p>
                        {delta.direction !== "flat" ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur-md shadow-sm",
                              delta.direction === "down" && "bg-teal/20 text-teal border border-teal/40",
                              delta.direction === "up" && "bg-signal/20 text-signal border border-signal/40"
                            )}
                          >
                            {delta.direction === "down" ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                            {delta.direction === "down" ? "Price Drop " : "Price Increase "}
                            {delta.label}
                          </span>
                        ) : (
                          <span className="rounded-full bg-black/40 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-md">
                            Price Stable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Metadata & Market Signal */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gold tracking-wider uppercase">
                      <Sparkles className="size-3 text-gold" />
                      <span>{signal}</span>
                    </div>
                    <p className="font-heading text-sm font-semibold tracking-tight text-foreground group-hover:text-gold transition-colors line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Competitor: <span className="text-foreground">{product.competitor}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Current Price</p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-mono text-base font-bold tabular-nums text-foreground">{formatMoney(product.currentPrice)}</p>
                        {product.previousPrice > 0 && product.previousPrice !== product.currentPrice ? (
                          <p className="font-mono text-xs tabular-nums text-muted-foreground line-through">
                            {formatMoney(product.previousPrice)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <StockPill status={product.stockStatus} />
                  </div>

                  {/* Hover Reveal Action */}
                  <div className="flex items-center justify-end text-xs font-semibold text-gold opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 pt-1">
                    <span>View Intelligence</span>
                    <ArrowRight className="ml-1 size-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}


