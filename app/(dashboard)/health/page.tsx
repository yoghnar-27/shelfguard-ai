"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { HealTimeline, HealthHero, ScraperRuns } from "@/components/health/health-panel"

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scraper Health"
        title="Self-healing, in plain sight"
        description="Collector status, extraction quality, and a heal timeline. Sequence below is demo choreography — Bright Data is not connected in Phase 1."
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast.info("Heal is demo-only", {
                description: "Phase 2 will call Bright Data refactor_template. Nothing was sent.",
              })
            }
          >
            Trigger self-heal (demo)
          </Button>
        }
      />

      <HealthHero />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Healing events</CardTitle>
            <CardDescription>09:41–09:44 demo recovery on collector c_demo_collector.</CardDescription>
          </CardHeader>
          <CardContent>
            <HealTimeline />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <ErrorState
            title="Detected failure (demo)"
            description="09:41 — price selector missed on AuraFlask Growler. Used to illustrate heal, not a live collector fault."
          />
          <Card>
            <CardHeader>
              <CardTitle>Overall health</CardTitle>
              <CardDescription>99.2% across the last successful demo window.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row k="Collector status" v="Healthy · watching" />
              <Row k="Last successful run" v="2 minutes ago" />
              <Row k="Extraction success" v="99.4%" />
              <Row k="Records collected" v="1,842" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collector runs</CardTitle>
          <CardDescription>Includes the staged failure used for the heal story.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScraperRuns />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  )
}
