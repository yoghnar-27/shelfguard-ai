"use client"

import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export type OpportunityItem = {
  id: string
  title: string
  description: string
  evidence: string
  recommendedAction: string
  severity: "critical" | "high" | "medium" | "low"
  score: number
  marketplace: string
}

function SignalStrengthMeter({ severity }: { severity: OpportunityItem["severity"] }) {
  const dotsMap = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  }
  const activeCount = dotsMap[severity] || 2

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Signal Strength</span>
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={cn(
            "size-2 rounded-full transition-colors duration-300",
            step <= activeCount
              ? severity === "critical"
                ? "bg-signal shadow-[0_0_6px_oklch(0.68_0.18_25)]"
                : severity === "high"
                  ? "bg-gold shadow-[0_0_6px_oklch(0.84_0.14_85)]"
                  : "bg-teal shadow-[0_0_6px_oklch(0.78_0.11_185)]"
              : "bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

export function RecommendationPanel({
  opportunities = [],
  cheapestMarketplace = "flipkart",
  gapAmount = 4991,
  amazonPrice = 3999,
  flipkartPrice = 8990,
}: {
  opportunities?: OpportunityItem[]
  cheapestMarketplace?: string
  gapAmount?: number
  amazonPrice?: number
  flipkartPrice?: number
}) {
  const mainSignal = opportunities.length > 0 ? opportunities[0] : null

  return (
    <Card className="relative overflow-hidden border-gold/40 bg-card/95 shadow-2xl hairline space-y-4 p-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/10 blur-3xl" />

      <CardHeader className="p-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-widest text-gold uppercase flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-gold" />
            Decision Intelligence
          </span>
          <SignalStrengthMeter severity={mainSignal ? mainSignal.severity : "high"} />
        </div>

        <CardTitle className="font-heading text-xl font-bold tracking-tight text-foreground">
          WHAT SHOULD YOU DO?
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Main Opportunity Banner */}
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-gold shrink-0" />
            <h4 className="font-heading text-base font-bold text-foreground">
              ⚡ PRICE DISPARITY DETECTED — {cheapestMarketplace.toUpperCase()} is currently {formatMoney(gapAmount)} below {cheapestMarketplace.toLowerCase() === "amazon" ? "FLIPKART" : "AMAZON"}.
            </h4>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-gold/15">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Why It Matters</p>
              <p className="text-xs text-foreground leading-relaxed">
                Significant cross-marketplace price variance indicates inconsistent channel pricing rules.
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-teal uppercase tracking-wider">Recommended Action</p>
              <p className="text-xs text-foreground leading-relaxed font-semibold">
                Review {cheapestMarketplace.toLowerCase() === "amazon" ? "Flipkart" : "Amazon"} channel listing price to protect brand margin thresholds.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono border-t border-gold/15 pt-2 text-muted-foreground">
            <span>Verified Evidence:</span>
            <span className="font-bold text-foreground">
              Amazon: {formatMoney(amazonPrice)} · Flipkart: {formatMoney(flipkartPrice)}
            </span>
          </div>
        </div>

        {/* Additional signals list if present */}
        {opportunities.length > 1 ? (
          <div className="space-y-2 pt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Additional Signals Detected ({opportunities.length - 1})
            </p>
            {opportunities.slice(1).map((opp) => (
              <div key={opp.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/50 p-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="size-4 text-teal shrink-0" />
                  <span className="font-medium text-foreground truncate">{opp.title}</span>
                </div>
                <span className="font-mono text-[10px] text-gold shrink-0">{opp.recommendedAction}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
