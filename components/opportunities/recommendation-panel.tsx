"use client"

import { Sparkles } from "lucide-react"
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
}: {
  opportunities?: OpportunityItem[]
  cheapestMarketplace?: string
  gapAmount?: number
  amazonPrice?: number
  flipkartPrice?: number
  myntraPrice?: number
}) {
  const mainSignal = opportunities.length > 0 ? opportunities[0] : null

  const mainOpportunityTitle = mainSignal
    ? mainSignal.title
    : gapAmount > 0
      ? `Price Disparity Detected — ${cheapestMarketplace.toUpperCase()} is ${formatMoney(gapAmount)} lower`
      : "Pricing Aligned Across Channels"

  const whyItMattersText = mainSignal
    ? mainSignal.description
    : "Cross-marketplace price variance affects channel conversion rates and brand perception."

  const actionText = mainSignal
    ? mainSignal.recommendedAction
    : `Review active channel pricing to align listing prices across Amazon, Flipkart, and Myntra.`

  return (
    <Card className="relative overflow-hidden border-gold/40 bg-card/95 shadow-2xl hairline space-y-4 p-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/10 blur-3xl" />

      <CardHeader className="p-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-widest text-gold uppercase flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-gold" />
            OPPORTUNITY DETECTED
          </span>
          <SignalStrengthMeter severity={mainSignal ? mainSignal.severity : "high"} />
        </div>

        <CardTitle className="font-heading text-lg font-bold tracking-tight text-foreground uppercase">
          {mainOpportunityTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gold uppercase tracking-wider">WHY IT MATTERS</p>
            <p className="text-xs text-foreground leading-relaxed">
              {whyItMattersText}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-teal uppercase tracking-wider">RECOMMENDED ACTION</p>
            <p className="text-xs text-foreground leading-relaxed font-semibold">
              {actionText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
