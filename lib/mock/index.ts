import {
  activity,
  changes,
  DEMO_NOW,
  healPipeline,
  healTimeline,
  kpis,
  movementSeries,
  opportunities,
  priceHistory,
  products,
  scraperRuns,
  stockHistory,
  workspace,
} from "@/lib/mock/data"
import type { Opportunity, Product } from "@/lib/mock/types"

export {
  activity,
  changes,
  DEMO_NOW,
  healPipeline,
  healTimeline,
  kpis,
  movementSeries,
  opportunities,
  priceHistory,
  products,
  scraperRuns,
  stockHistory,
  workspace,
}

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductChanges(id: string) {
  return changes.filter((change) => change.productId === id)
}

export function getProductOpportunities(id: string) {
  return opportunities.filter((opportunity) => opportunity.productId === id)
}

export function getOpportunity(id: string): Opportunity | undefined {
  return opportunities.find((opportunity) => opportunity.id === id)
}

export function getPriceHistory(id: string) {
  return priceHistory[id] ?? []
}

export function getStockHistory(id: string) {
  return stockHistory[id] ?? []
}

export function getWatchlist() {
  return products
}

export function getCompetitorsFor(product: Product) {
  return products.filter(
    (item) => item.category === product.category && item.id !== product.id
  )
}
