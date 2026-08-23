import Link from "next/link"
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MonitorPill, StockPill } from "@/components/dashboard/status-pills"
import { formatDelta, formatMoney } from "@/lib/format"
import { products } from "@/lib/mock"
import { cn } from "@/lib/utils"

export function ProductGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 page-enter">
      {products.map((product) => {
        const delta = formatDelta(product.currentPrice, product.previousPrice)
        return (
          <li key={product.id}>
            <Link href={`/products/${product.id}`} className="group block h-full">
              <Card className="card-hover hairline relative overflow-hidden h-full border-border/80 bg-card/90 hover:border-gold/30 hover:shadow-xl">
                <CardContent className="space-y-4 p-4">
                  <div
                    className={cn(
                      "relative h-28 rounded-xl bg-gradient-to-br p-3 flex flex-col justify-between overflow-hidden",
                      product.imageTone
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 z-10">
                      <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/90 uppercase tracking-wider backdrop-blur-md">
                        {product.category}
                      </span>
                      <MonitorPill status={product.monitorStatus} />
                    </div>

                    <div className="flex items-end justify-between z-10">
                      <p className="font-mono text-xs font-semibold text-white/80">{product.sku}</p>
                      {delta.direction !== "flat" ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur-md",
                            delta.direction === "down" && "bg-teal/20 text-teal border border-teal/40",
                            delta.direction === "up" && "bg-signal/20 text-signal border border-signal/40"
                          )}
                        >
                          {delta.direction === "down" ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                          {delta.label}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-heading text-sm font-semibold tracking-tight text-foreground group-hover:text-gold transition-colors line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Seller: {product.competitor}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Current Price</p>
                      <p className="font-mono text-base font-bold tabular-nums text-foreground">{formatMoney(product.currentPrice)}</p>
                    </div>
                    <StockPill status={product.stockStatus} />
                  </div>

                  <div className="flex items-center justify-end text-xs font-semibold text-gold opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
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

