export type SupportedMarketplace =
  | "amazon"
  | "flipkart"
  | "myntra"

export type MarketplaceProduct = {
  marketplace: SupportedMarketplace
  productName: string
  brand: string
  productId: string
  price: number
  originalPrice: number
  currency: string
  stockStatus: "in_stock" | "low_stock" | "out_of_stock"
  rating?: number | null
  reviewCount?: number | null
  imageUrl?: string | null
  productUrl: string
  lastChecked: string
  isLive: boolean
  error?: string | null
}

export type OpportunityRuleKind =
  | "PRICE_UNDERCUT"
  | "PRICE_GAP"
  | "STOCKOUT_OPPORTUNITY"
  | "PRICE_DROP"
  | "LOW_STOCK"
  | "COMPETITIVE_MOVEMENT"

export type DetectedOpportunitySignal = {
  id: string
  rule: OpportunityRuleKind
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  evidence: string
  recommendedAction: string
  impact: string
  score: number
  marketplace: SupportedMarketplace
  detectedAt: string
  isLive: boolean
}

export type PriceComparisonSummary = {
  lowestPrice: number
  highestPrice: number
  priceSpread: number
  priceSpreadPercentage: number
  cheapestMarketplace: SupportedMarketplace
  mostExpensiveMarketplace: SupportedMarketplace
}

export type StockComparisonSummary = {
  inStockCount: number
  outOfStockCount: number
  outOfStockMarketplaces: SupportedMarketplace[]
}

export type CompetitiveComparison = {
  productId: string
  productName: string
  brand: string
  category: string
  offers: MarketplaceProduct[]
  priceSummary: PriceComparisonSummary
  stockSummary: StockComparisonSummary
  opportunities: DetectedOpportunitySignal[]
}
