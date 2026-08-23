"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ChevronDown, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/dashboard/link-button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScoreRing } from "@/components/dashboard/score-ring"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"
import type { Opportunity } from "@/lib/mock/types"

function severityClass(severity: Opportunity["severity"]) {
  if (severity === "high" || severity === "critical") {
    return "border-signal/40 bg-signal/10 text-signal shadow-[0_0_12px_oklch(0.68_0.18_25_/_0.2)]"
  }
  if (severity === "medium") return "border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_oklch(0.84_0.14_85_/_0.2)]"
  return "border-border bg-muted/50 text-muted-foreground"
}

export function OpportunityCard({
  opportunity,
  defaultOpen = false,
}: {
  opportunity: Opportunity
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [drawer, setDrawer] = useState(false)
  const isHighPriority = opportunity.severity === "high" || opportunity.severity === "critical"

  return (
    <>
      <Card
        className={cn(
          "card-hover hairline relative overflow-hidden transition-all duration-300 hover:border-gold/30 hover:bg-card/90",
          isHighPriority && "pulse-subtle border-signal/30"
        )}
      >
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              className="group min-w-0 flex-1 text-left focus-visible:rounded-md"
              aria-expanded={open}
              aria-controls={`opp-${opportunity.id}-detail`}
              onClick={() => setOpen((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                    severityClass(opportunity.severity)
                  )}
                >
                  <Sparkles className="size-3" />
                  {opportunity.severity} impact
                </span>
              </div>
              <p className="mt-2 font-heading text-base font-bold tracking-tight text-foreground group-hover:text-gold transition-colors">
                {opportunity.event}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Product: <span className="text-foreground font-semibold">{opportunity.productName}</span> ({opportunity.competitor})
              </p>
            </button>
            <ScoreRing score={opportunity.score} />
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-background/40 p-3 text-xs">
            <div>
              <dt className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Estimated Impact
              </dt>
              <dd className="mt-1 font-medium text-foreground">{opportunity.impact}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Opportunity Score
              </dt>
              <dd className="mt-1 font-mono font-bold tabular-nums text-gold">{opportunity.score} / 100</dd>
            </div>
          </dl>

          <div
            id={`opp-${opportunity.id}-detail`}
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              open ? "grid-rows-[1fr] opacity-100 pt-1" : "grid-rows-[0fr] opacity-0 overflow-hidden"
            )}
          >
            <div className="overflow-hidden space-y-3.5 border-t border-border/60 pt-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                  <p className="text-[10px] font-bold tracking-widest text-gold uppercase">
                    Why This Matters
                  </p>
                  <p className="mt-1 text-xs text-foreground leading-relaxed">
                    Direct competitor pricing or availability shift creating a high-converting window for your listing.
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                  <p className="text-[10px] font-bold tracking-widest text-teal uppercase">
                    Evidence
                  </p>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    {opportunity.event} ({formatDateTime(opportunity.at)})
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Recommended Action
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground font-medium bg-muted/40 p-2.5 rounded-lg border border-border/40">
                  “{opportunity.action}”
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                <span className="font-bold text-muted-foreground uppercase tracking-wider">Potential Impact:</span>
                <span className="font-semibold text-teal">{opportunity.impact}</span>
              </div>
            </div>
          </div>



          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" onClick={() => setDrawer(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
              Review opportunity
            </Button>
            <LinkButton size="sm" variant="outline" href={`/products/${opportunity.productId}`}>
              Open product
              <ExternalLink className="ml-1 size-3" />
            </LinkButton>
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {open ? "Hide detail" : "Show detail"}
              <ChevronDown className={cn("ml-1 size-3.5 transition-transform duration-200", open && "rotate-180")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <OpportunityDrawer
        opportunity={opportunity}
        open={drawer}
        onOpenChange={setDrawer}
      />
    </>
  )
}

export function OpportunityDrawer({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-card border-border/80">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg">Opportunity Intelligence</SheetTitle>
          <SheetDescription className="text-xs">
            Evaluated recommendation based on detected market changes. (Simulation Mode)
          </SheetDescription>
        </SheetHeader>
        <div className="my-4 space-y-4 px-1">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Competitor</p>
                <p className="font-medium text-foreground">{opportunity.competitor}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
                <p className="font-medium text-foreground">{opportunity.productName}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Detected event</p>
                <p className="font-medium text-teal">{opportunity.event}</p>
              </div>
            </div>
            <ScoreRing score={opportunity.score} />
          </div>

          <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Recommended Strategy</p>
            <p className="text-sm font-medium leading-relaxed text-foreground">“{opportunity.action}”</p>
            <p className="text-xs text-muted-foreground pt-1 border-t border-gold/15">{formatDateTime(opportunity.at)}</p>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={() => {
              toast.success("Opportunity queued for review", {
                description: "Simulation mode — item added to seller decision queue.",
              })
              onOpenChange(false)
            }}
          >
            Queue Recommended Action
          </Button>
          <LinkButton variant="outline" className="w-full" href={`/products/${opportunity.productId}`}>
            Inspect Product Details
          </LinkButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

