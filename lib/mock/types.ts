export type StockStatus = "in_stock" | "low_stock" | "out_of_stock"
export type MonitorStatus = "watching" | "paused" | "healing"
export type ChangeKind =
  | "price_drop"
  | "price_increase"
  | "stockout"
  | "restock"
  | "variant_change"
  | "noise"
export type OpportunitySeverity = "critical" | "high" | "medium" | "low"
export type ActivityKind =
  | "price"
  | "stock"
  | "scraper_run"
  | "scraper_failure"
  | "healing"
  | "opportunity"
export type HealStepStatus = "complete" | "current" | "pending"

export type Product = {
  id: string
  name: string
  sku: string
  competitor: string
  competitorId: string
  category: string
  url: string
  currentPrice: number
  previousPrice: number
  currency: string
  stockStatus: StockStatus
  stockUnits: number | null
  lastChecked: string
  monitorStatus: MonitorStatus
  variants: string[]
  imageTone: string
}

export type PricePoint = {
  date: string
  price: number
}

export type StockPoint = {
  date: string
  status: StockStatus
  units: number | null
}

export type DetectedChange = {
  id: string
  productId: string
  kind: ChangeKind
  material: boolean
  summary: string
  detail: string
  at: string
}

export type Opportunity = {
  id: string
  productId: string
  competitor: string
  productName: string
  severity: OpportunitySeverity
  event: string
  impact: string
  score: number
  action: string
  at: string
  window: string
}

export type ScraperRun = {
  id: string
  startedAt: string
  durationMs: number
  records: number
  successRate: number
  status: "success" | "partial" | "failed"
  note: string
}

export type HealEvent = {
  time: string
  title: string
  detail: string
  status: HealStepStatus
}

export type HealPipelineStep = {
  time: string
  step: string
  detail: string
}

export type ActivityEvent = {
  id: string
  kind: ActivityKind
  title: string
  detail: string
  at: string
  productId?: string
}

export type Workspace = {
  name: string
  seller: string
  region: string
  demo: true
  collectorId: string
  collectorNote: string
}

export type DashboardKpis = {
  trackedProducts: number
  materialChanges: number
  activeOpportunities: number
  scraperHealth: number
  lastRunAgo: string
  extractionRate: number
  recordsCollected: number
}
