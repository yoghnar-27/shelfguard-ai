import { healTimeline, kpis, scraperRuns } from "@/lib/mock"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeartPulse, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

export function HealthHero() {
  return (
    <Card className="relative overflow-hidden border-teal/30 bg-gradient-to-br from-card via-card/90 to-teal/5 shadow-xl hairline">
      <div
        className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-teal/10 blur-3xl"
        aria-hidden
      />
      <CardHeader className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold tracking-wider text-teal uppercase">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-teal" />
              </span>
              Operational Status: Healthy
            </span>
            <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
              Self-Healing Active
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-teal font-mono text-sm font-semibold">
            <HeartPulse className="size-5 heartbeat text-teal" />
            <span>{kpis.scraperHealth}% Availability</span>
          </div>
        </div>

        <CardTitle className="mt-4 font-heading text-2xl tracking-tight text-foreground">
          System Operational Health
        </CardTitle>
        <CardDescription className="max-w-2xl text-xs sm:text-sm">
          Automated structural resilience pipeline monitoring marketplace availability, rate limits, and scan integrity.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
        <Stat label="Monitoring Status" value="Active — 100% Online" />
        <Stat label="Last Successful Scan" value={kpis.lastRunAgo} />
        <Stat label="Extraction Success Rate" value={`${kpis.extractionRate}%`} />
        <Stat label="Total Extracted Items" value={kpis.recordsCollected.toLocaleString()} />
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
    <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 shadow-sm">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold text-foreground", mono && "font-mono text-gold")}>{value}</p>
    </div>
  )
}

export function HealTimeline() {
  const steps = [
    { title: "Detection", status: "complete", label: "DOM Selector Miss" },
    { title: "Diagnosis", status: "complete", label: "Structural Change Identified" },
    { title: "Repair", status: "complete", label: "Auto-Refactored Selector" },
    { title: "Verification", status: "active", label: "Validation Clean" },
  ]

  return (
    <div className="space-y-6">
      {/* 4-Step Self-Healing Sequence Bar */}
      <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-gold uppercase mb-3">
          Self-Healing Sequence Pipeline
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((s, idx) => (
            <div
              key={s.title}
              className={cn(
                "relative rounded-lg border p-2.5 transition-all duration-200",
                s.status === "active"
                  ? "border-teal/40 bg-teal/10 shadow-[0_0_12px_oklch(0.78_0.11_185_/_0.2)]"
                  : "border-border/60 bg-background/50"
              )}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase">
                <span>0{idx + 1}. {s.title}</span>
                <CheckCircle2 className="size-3 text-teal" />
              </div>
              <p className="mt-1 font-mono text-[11px] font-semibold text-foreground truncate">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ol className="relative space-y-0">
        {healTimeline.map((event, index) => {
          const isSuccess = event.title.includes("Recovery") || event.title.includes("Approval")
          const isWarning = event.title.includes("Failure") || event.title.includes("Missed")

          return (
            <li key={`${event.time}-${event.title}`} className="relative grid grid-cols-[4.5rem_1fr] gap-4 pb-6 last:pb-0">
              {index < healTimeline.length - 1 ? (
                <span
                  className="absolute top-6 left-[calc(4.5rem+0.35rem)] h-[calc(100%-0.5rem)] w-0.5 bg-gradient-to-b from-gold via-border to-border/40"
                  aria-hidden
                />
              ) : null}
              <time className="pt-0.5 font-mono text-xs font-semibold text-gold tabular-nums">{event.time}</time>
              <div className="group relative rounded-xl border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:border-gold/30 hover:bg-card">
                <span
                  className={cn(
                    "absolute top-4 -left-[1.2rem] size-3 rounded-full border-2 border-background shadow-md",
                    isSuccess && "bg-teal border-teal shadow-[0_0_10px_oklch(0.78_0.11_185_/_0.6)]",
                    isWarning && "bg-signal border-signal shadow-[0_0_10px_oklch(0.68_0.18_25_/_0.6)]",
                    !isSuccess && !isWarning && "bg-gold border-gold shadow-[0_0_10px_oklch(0.84_0.14_85_/_0.6)]"
                  )}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors">{event.title}</p>
                  {isSuccess ? <CheckCircle2 className="size-4 text-teal" /> : null}
                  {isWarning ? <AlertCircle className="size-4 text-signal" /> : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{event.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}


export function ScraperRuns() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/80">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Recent scraper runs (demo)</caption>
        <thead className="bg-muted/30 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          <tr className="border-b border-border/70">
            <th className="px-4 py-3 font-medium">Run ID</th>
            <th className="px-4 py-3 font-medium">Started</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Records Extracted</th>
            <th className="px-4 py-3 font-medium">Diagnostic Note</th>
          </tr>
        </thead>
        <tbody>
          {scraperRuns.map((run) => (
            <tr key={run.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{run.id}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground font-mono tabular-nums">{formatDateTime(run.startedAt)}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                    run.status === "success" && "border-teal/30 bg-teal/10 text-teal",
                    run.status === "partial" && "border-gold/30 bg-gold/10 text-gold",
                    run.status === "failed" && "border-signal/30 bg-signal/10 text-signal"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      run.status === "success" && "bg-teal",
                      run.status === "partial" && "bg-gold",
                      run.status === "failed" && "bg-signal"
                    )}
                  />
                  {run.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs tabular-nums text-foreground">{run.records}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{run.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

