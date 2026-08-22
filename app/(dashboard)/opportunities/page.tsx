"use client"

import { useMemo, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { OpportunityCard } from "@/components/opportunities/opportunity-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { opportunities } from "@/lib/mock"
import type { OpportunitySeverity } from "@/lib/mock/types"

export default function OpportunitiesPage() {
  const [tab, setTab] = useState<"all" | OpportunitySeverity>("all")
  const rows = useMemo(() => {
    if (tab === "all") return opportunities
    return opportunities.filter((item) => item.severity === tab)
  }, [tab])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Opportunities"
        title="Opportunity intelligence"
        description="Material competitor events scored for seller action. Demo recommendations only — no live pricing system."
      />
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="low">Low</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {rows.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {rows.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No opportunities in this band"
              description="Severity filters apply to the demo set. High-impact stockouts live under High."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
