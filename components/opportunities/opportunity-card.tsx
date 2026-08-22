"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
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
    return "border-signal/30 bg-signal/10 text-signal"
  }
  if (severity === "medium") return "border-gold/30 bg-gold/10 text-gold"
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

  return (
    <>
      <Card className="card-hover hairline hover:bg-muted/10">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              className="min-w-0 flex-1 text-left focus-visible:rounded-md"
              aria-expanded={open}
              aria-controls={`opp-${opportunity.id}-detail`}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
                  severityClass(opportunity.severity)
                )}
              >
                {opportunity.severity} priority
              </span>
              <p className="mt-2 font-heading text-base tracking-tight">
                {opportunity.productName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {opportunity.competitor} · {opportunity.event.replace("went ", "")}
              </p>
            </button>
            <ScoreRing score={opportunity.score} />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Estimated impact
              </dt>
              <dd className="mt-0.5 font-medium">{opportunity.impact}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Opportunity score
              </dt>
              <dd className="mt-0.5 font-medium tabular-nums">{opportunity.score} / 100</dd>
            </div>
          </dl>

          <div id={`opp-${opportunity.id}-detail`} hidden={!open}>
            <div className="space-y-3 border-t border-border/70 pt-3">
              <div>
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Recommended action
                </p>
                <p className="mt-1 text-sm leading-relaxed">“{opportunity.action}”</p>
              </div>
              <p className="text-xs text-muted-foreground">{opportunity.window}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setDrawer(true)}>
              Review opportunity
            </Button>
            <LinkButton size="sm" variant="outline" href={`/products/${opportunity.productId}`}>
              Open product
            </LinkButton>
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Hide detail" : "Show detail"}
              <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
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
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Opportunity intelligence</SheetTitle>
          <SheetDescription>
            Demo recommendation from mock competitor changes. Not a live pricing model.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-start justify-between gap-4 px-4">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Competitor</p>
              <p className="font-medium">{opportunity.competitor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Product</p>
              <p className="font-medium">{opportunity.productName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Detected event</p>
              <p className="font-medium">{opportunity.event}</p>
            </div>
          </div>
          <ScoreRing score={opportunity.score} />
        </div>
        <div className="space-y-2 px-4">
          <p className="text-sm leading-relaxed">“{opportunity.action}”</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(opportunity.at)}</p>
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              toast.message("Queued for seller review", {
                description: "Demo only — no pricing system is connected.",
              })
              onOpenChange(false)
            }}
          >
            Queue recommended action
          </Button>
          <LinkButton variant="outline" href={`/products/${opportunity.productId}`}>
            Inspect product
          </LinkButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
