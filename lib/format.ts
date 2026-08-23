import type { StockStatus } from "@/lib/mock/types"

/**
 * Formats numeric values into Indian Rupees (INR) with Indian number grouping (en-IN).
 * Safely handles numbers, numeric strings, zero, null/undefined, and returns "Unavailable" for <= 0.
 */
export function formatINR(value?: number | string | null): string {
  if (value === null || value === undefined) return "Unavailable"
  const num = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.]/g, "")) : value
  if (Number.isNaN(num) || num <= 0) return "Unavailable"

  return `₹${num.toLocaleString("en-IN")}`
}

export function formatMoney(value?: number | string | null): string {
  return formatINR(value)
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
  const absAmount = Math.abs(amount)
  return {
    amount,
    pct,
    label: `${sign}₹${absAmount.toLocaleString("en-IN")} (${sign}${pct.toFixed(1)}%)`,
    direction: amount === 0 ? "flat" : amount < 0 ? "down" : "up",
  } as const
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
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
