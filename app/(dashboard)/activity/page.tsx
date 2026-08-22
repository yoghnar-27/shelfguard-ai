import { PageHeader } from "@/components/dashboard/page-header"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { Card, CardContent } from "@/components/ui/card"

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="What changed, in order"
        description="Price, stock, scraper runs, failures, healing, and opportunity detection from the demo clock (22 Aug 2026)."
      />
      <Card>
        <CardContent className="pt-1">
          <ActivityTimeline />
        </CardContent>
      </Card>
    </div>
  )
}
