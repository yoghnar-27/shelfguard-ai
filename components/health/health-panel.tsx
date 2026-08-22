import { healTimeline, kpis, scraperRuns, workspace } from "@/lib/mock"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

export function HealthHero() {
  return (
    <Card className="relative overflow-hidden border-teal/20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,oklch(0.8_0.1_185_/_0.18),transparent_42%)]"
        aria-hidden
      />
      <CardHeader className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold tracking-wide text-teal uppercase">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-teal opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-teal" />
            </span>
            Healthy
          </span>
          <Badge variant="outline">Demo collector</Badge>
        </div>
        <CardTitle className="mt-3 text-xl">Self-healing collector</CardTitle>
        <CardDescription>
          Visual of a heal cycle. This sequence is demo data — Bright Data is not connected yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Collector" value={workspace.collectorId} mono />
        <Stat label="Last run" value={kpis.lastRunAgo} />
        <Stat label="Extraction" value={`${kpis.extractionRate}%`} />
        <Stat label="Records collected" value={kpis.recordsCollected.toLocaleString()} />
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/40 px-3 py-3">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 text-sm font-medium", mono && "font-mono")}>{value}</p>
    </div>
  )
}

export function HealTimeline() {
  return (
    <ol className="relative space-y-0">
      {healTimeline.map((event, index) => (
        <li key={`${event.time}-${event.title}`} className="relative grid grid-cols-[4.5rem_1fr] gap-4 pb-6 last:pb-0">
          {index < healTimeline.length - 1 ? (
            <span
              className="absolute top-6 left-[calc(4.5rem+0.35rem)] h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-gold/70 to-border"
              aria-hidden
            />
          ) : null}
          <time className="pt-0.5 font-mono text-xs text-gold tabular-nums">{event.time}</time>
          <div className="relative rounded-xl border border-border/80 bg-card/60 px-4 py-3">
            <span
              className="absolute top-3 -left-[1.15rem] size-2.5 rounded-full border border-gold bg-gold shadow-[0_0_12px_oklch(0.84_0.13_85_/_0.7)]"
              aria-hidden
            />
            <p className="font-medium">{event.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ScraperRuns() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Recent scraper runs (demo)</caption>
        <thead className="text-xs tracking-wide text-muted-foreground uppercase">
          <tr className="border-b border-border/70">
            <th className="py-2 pr-3 font-medium">Run</th>
            <th className="py-2 pr-3 font-medium">Started</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Records</th>
            <th className="py-2 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {scraperRuns.map((run) => (
            <tr key={run.id} className="border-b border-border/50 last:border-0">
              <td className="py-3 pr-3 font-mono text-xs">{run.id}</td>
              <td className="py-3 pr-3 text-muted-foreground">{formatDateTime(run.startedAt)}</td>
              <td className="py-3 pr-3">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    run.status === "success" && "border-teal/30 bg-teal/10 text-teal",
                    run.status === "partial" && "border-gold/30 bg-gold/10 text-gold",
                    run.status === "failed" && "border-signal/30 bg-signal/10 text-signal"
                  )}
                >
                  {run.status}
                </span>
              </td>
              <td className="py-3 pr-3 tabular-nums">{run.records}</td>
              <td className="py-3 text-muted-foreground">{run.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
