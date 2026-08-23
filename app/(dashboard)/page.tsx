import { LinkButton } from "@/components/dashboard/link-button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MovementChart } from "@/components/dashboard/charts"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { CommandHero } from "@/components/dashboard/command-hero"
import { StockPill } from "@/components/dashboard/status-pills"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { OpportunityCard } from "@/components/opportunities/opportunity-card"
import { formatMoney } from "@/lib/format"
import { kpis, movementSeries, opportunities, products } from "@/lib/mock"
import { Sparkles, ArrowRight, HeartPulse } from "lucide-react"

export default function CommandCenterPage() {
  const stockouts = products.filter((p) => p.stockStatus === "out_of_stock")
  const featured = opportunities[0]

  return (
    <div className="space-y-6 page-enter">
      <CommandHero
        actions={
          <>
            <LinkButton size="sm" href="/opportunities" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Sparkles className="mr-1.5 size-3.5" />
              Review Opportunities
            </LinkButton>
            <LinkButton size="sm" variant="outline" href="/health" className="border-teal/30 text-teal hover:bg-teal/10">
              <HeartPulse className="mr-1.5 size-3.5" />
              Scraper Health
            </LinkButton>
          </>
        }
      />

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tracked products"
          value={kpis.trackedProducts}
          hint="SKUs on the watchlist across monitored market competitors"
          icon="boxes"
        />
        <KpiCard
          label="Material changes"
          value={kpis.materialChanges}
          hint="Price drops, stockouts, and variant moves above noise threshold"
          icon="delta"
          tone="gold"
        />
        <KpiCard
          label="Active opportunities"
          value={kpis.activeOpportunities}
          hint="Actionable competitor shifts awaiting seller evaluation"
          icon="spark"
          tone="signal"
        />
        <KpiCard
          label="Scraper health"
          value={kpis.scraperHealth}
          decimals={1}
          suffix="%"
          hint="Extraction success rate across recent collector runs"
          icon="pulse"
          tone="teal"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-visible hairline border-border/80 bg-card/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">Market Price Movement</CardTitle>
                <CardDescription className="text-xs">
                  Material price drops, increases, and stockout events detected this week.
                </CardDescription>
              </div>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-gold uppercase">
                7-Day Window
              </span>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <MovementChart data={movementSeries} />
          </CardContent>
        </Card>
        
        <Card className="border-gold/30 hairline bg-card/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">Opportunity Intelligence</CardTitle>
                <CardDescription className="text-xs">Highest-priority opportunity signal in queue.</CardDescription>
              </div>
              <span className="rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-signal uppercase">
                High Priority
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <OpportunityCard opportunity={featured} defaultOpen />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="hairline bg-card/90">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Stockout Alerts</CardTitle>
              <CardDescription className="text-xs">Competitor product detail pages currently unavailable.</CardDescription>
            </div>
            <LinkButton variant="ghost" size="sm" href="/watchlist" className="text-xs text-muted-foreground hover:text-foreground">
              Watchlist
              <ArrowRight className="ml-1 size-3" />
            </LinkButton>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {stockouts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 transition-all duration-200 hover:border-gold/30 hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground group-hover:text-gold transition-colors">
                    {product.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {product.competitor} · <span className="font-mono tabular-nums text-foreground">{formatMoney(product.currentPrice)}</span>
                  </p>
                </div>
                <StockPill status={product.stockStatus} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="hairline bg-card/90">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Live Competitor Stream</CardTitle>
              <CardDescription className="text-xs">Real-time market events, scraper runs, and self-heal steps.</CardDescription>
            </div>
            <LinkButton variant="ghost" size="sm" href="/activity" className="text-xs text-muted-foreground hover:text-foreground">
              Full Activity
              <ArrowRight className="ml-1 size-3" />
            </LinkButton>
          </CardHeader>
          <CardContent>
            <ActivityTimeline limit={4} />
          </CardContent>
        </Card>
      </section>

      <Card className="hairline bg-gradient-to-r from-card via-card/90 to-teal/5 border-teal/20">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="font-heading text-lg">Extraction Engine Status</CardTitle>
              <CardDescription className="text-xs">
                Scraper Collector operating at <span className="font-mono text-teal font-semibold">{kpis.extractionRate}% extraction accuracy</span>.
              </CardDescription>
            </div>
            <LinkButton size="sm" variant="outline" href="/health" className="border-teal/30 text-teal hover:bg-teal/10 text-xs">
              View Health Timeline
            </LinkButton>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-border/50 pt-3">
          <p className="text-muted-foreground font-medium">
            Last successful run {kpis.lastRunAgo} · <span className="font-mono text-foreground">{kpis.recordsCollected.toLocaleString()}</span> lifetime records collected · health status{" "}
            <span className="font-mono text-teal font-semibold">{kpis.scraperHealth}%</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

