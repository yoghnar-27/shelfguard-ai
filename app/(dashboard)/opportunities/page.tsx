"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { OpportunityCard } from "@/components/opportunities/opportunity-card"
import { opportunities } from "@/lib/mock"

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Opportunities"
        title="Opportunity intelligence"
        description="Material competitor events scored for seller action across Amazon, Flipkart & Myntra."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    </div>
  )
}
