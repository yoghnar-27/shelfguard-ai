import { PageHeader } from "@/components/dashboard/page-header"
import { WatchlistTable } from "@/components/products/watchlist-table"

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Watchlist"
        title="Every SKU on the wire"
        description="Current vs previous price, stock, and monitoring state from the demo catalog. Replace this layer with Bright Data snapshots in Phase 2."
      />
      <WatchlistTable />
    </div>
  )
}
