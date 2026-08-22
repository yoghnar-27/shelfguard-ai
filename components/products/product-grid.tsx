import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MonitorPill, StockPill } from "@/components/dashboard/status-pills"
import { formatMoney } from "@/lib/format"
import { products } from "@/lib/mock"
import { cn } from "@/lib/utils"

export function ProductGrid() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <Link href={`/products/${product.id}`} className="block h-full">
            <Card className="hairline h-full transition-transform hover:-translate-y-0.5 hover:bg-card/80">
              <CardContent className="space-y-3">
                <div
                  className={cn(
                    "h-24 rounded-lg bg-gradient-to-br",
                    product.imageTone
                  )}
                  aria-hidden
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.competitor}</p>
                  </div>
                  <MonitorPill status={product.monitorStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm tabular-nums">{formatMoney(product.currentPrice)}</p>
                  <StockPill status={product.stockStatus} />
                </div>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  )
}
