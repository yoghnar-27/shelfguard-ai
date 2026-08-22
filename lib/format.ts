import type { StockStatus } from "@/lib/mock/types"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatMoney(value: number) {
  return currency.format(value)
}

export function formatPct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`
}

export function priceDelta(current: number, previous: number) {
  const amount = current - previous
  const pct = previous === 0 ? 0 : (amount / previous) * 100
  return { amount, pct }
}

export function formatDelta(current: number, previous: number) {
  const { amount, pct } = priceDelta(current, previous)
  const sign = amount > 0 ? "+" : amount < 0 ? "" : ""
  return {
    amount,
    pct,
    label: `${sign}${formatMoney(amount)} (${sign}${pct.toFixed(1)}%)`,
    direction: amount === 0 ? "flat" : amount < 0 ? "down" : "up",
  } as const
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(new Date(iso))
}

export function formatRelative(iso: string, nowIso: string) {
  const diff = new Date(nowIso).getTime() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function stockLabel(status: StockStatus) {
  if (status === "in_stock") return "In stock"
  if (status === "low_stock") return "Low stock"
  return "Out of stock"
}
