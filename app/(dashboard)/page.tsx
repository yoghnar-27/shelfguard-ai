import { LinkButton } from "@/components/dashboard/link-button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MovementChart } from "@/components/dashboard/charts"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { StockPill } from "@/components/dashboard/status-pills"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { OpportunityCard } from "@/components/opportunities/opportunity-card"
import { formatMoney } from "@/lib/format"
import { kpis, movementSeries, opportunities, products } from "@/lib/mock"

export default function CommandCenterPage() {
  const stockouts = products.filter((p) => p.stockStatus === "out_of_stock")
  const featured = opportunities[0]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command Center"
        title="Market is moving. You already see it."
        description="Your competitors change. ShelfGuard notices. Demo workspace for Northstar Home — mock extracts only, Bright Data is not connected."
        actions={
          <>
            <LinkButton size="sm" href="/opportunities">
              Review opportunities
            </LinkButton>
            <LinkButton size="sm" variant="outline" href="/health">
              Scraper health
            </LinkButton>
          </>
        }
      />

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tracked products"
          value={kpis.trackedProducts}
          hint="SKUs on the watchlist across demo competitors"
          icon="boxes"
        />
        <KpiCard
          label="Material changes"
          value={kpis.materialChanges}
          hint="Price, stock, and variant moves above the noise threshold"
          icon="delta"
          tone="gold"
        />
        <KpiCard
          label="Active opportunities"
          value={kpis.activeOpportunities}
          hint="Actionable events waiting on seller review"
          icon="spark"
          tone="signal"
        />
        <KpiCard
          label="Scraper health"
          value={kpis.scraperHealth}
          decimals={1}
          suffix="%"
          hint="Demo extraction success across recent collector runs"
          icon="pulse"
          tone="teal"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Price movement</CardTitle>
            <CardDescription>Material drops, increases, and stockouts this week (demo).</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <MovementChart data={movementSeries} />
          </CardContent>
        </Card>
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle>Opportunity feed</CardTitle>
            <CardDescription>Highest-scoring event in the demo set.</CardDescription>
          </CardHeader>
          <CardContent>
            <OpportunityCard opportunity={featured} defaultOpen />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Stockout alerts</CardTitle>
              <CardDescription>Competitor PDPs currently unavailable.</CardDescription>
            </div>
            <LinkButton variant="ghost" size="sm" href="/watchlist">
              Watchlist
            </LinkButton>
          </CardHeader>
          <CardContent className="space-y-2">
            {stockouts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.competitor} · {formatMoney(product.currentPrice)}
                  </p>
                </div>
                <StockPill status={product.stockStatus} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent competitor activity</CardTitle>
            <CardDescription>Price, stock, scraper, and heal events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTimeline limit={4} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent scraper activity</CardTitle>
          <CardDescription>
            Collector <span className="font-mono">{kpis.extractionRate}% extraction</span> on the last successful demo run.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Last run {kpis.lastRunAgo} · {kpis.recordsCollected.toLocaleString()} lifetime demo records · health{" "}
            {kpis.scraperHealth}%
          </p>
          <LinkButton size="sm" variant="outline" href="/health">
            Open health timeline
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  )
}
