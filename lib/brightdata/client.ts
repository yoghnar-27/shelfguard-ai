import type { Product } from "@/lib/mock/types"
import { mapBrightDataToShelfGuardProduct } from "./mapper"
import type { BrightDataPollOptions, BrightDataProduct, BrightDataTriggerResponse } from "./types"

/**
 * Server-Only Bright Data API Client Abstraction
 *
 * Provides server-side utility functions to interface with Bright Data API.
 * Ensures API keys are kept strictly within server execution contexts.
 */

if (typeof window !== "undefined") {
  throw new Error("BrightData client module cannot be imported in client-side code.")
}

export type BrightDataConfig = {
  apiKey: string
  collectorId: string
  baseUrl: string
}

/**
 * Strips sensitive Bright Data API key from error strings if present.
 */
function sanitizeError(error: unknown, apiKey?: string): Error {
  const message = error instanceof Error ? error.message : String(error)
  if (!apiKey) {
    return new Error(message)
  }
  const sanitized = message.replaceAll(apiKey, "[REDACTED_API_KEY]")
  return new Error(sanitized)
}

/**
 * Cleans string input by trimming and removing any surrounding quotation marks.
 */
function cleanEnvString(val?: string): string {
  if (!val) return ""
  return val.trim().replace(/^["']|["']$/g, "")
}

/**
 * Retrieves Bright Data configuration strictly from server environment variables.
 */
export function getBrightDataConfig(): BrightDataConfig {
  const apiKey = cleanEnvString(process.env.BRIGHTDATA_API_KEY)
  const collectorId = cleanEnvString(process.env.BRIGHTDATA_COLLECTOR_ID)
  const baseUrl = cleanEnvString(process.env.BRIGHTDATA_API_BASE_URL || "https://api.brightdata.com")

  if (!apiKey || !collectorId) {
    throw new Error(
      "Bright Data environment variables missing. Ensure BRIGHTDATA_API_KEY and BRIGHTDATA_COLLECTOR_ID are defined."
    )
  }

  return {
    apiKey,
    collectorId,
    baseUrl: baseUrl.replace(/\/$/, ""),
  }
}

export type TriggerScrapeParams = {
  url?: string
  inputs?: Array<Record<string, unknown>>
  collectorId?: string
}

/**
 * Dispatches a trigger request to Bright Data's scraping API endpoint.
 * Dynamically handles both Scraper Studio (/dca/trigger) and Datasets v3 (/datasets/v3/trigger) flows.
 */
export async function triggerBrightDataScrape(
  params: TriggerScrapeParams
): Promise<BrightDataTriggerResponse> {
  const config = getBrightDataConfig()
  const activeCollectorId = cleanEnvString(params.collectorId || config.collectorId)
  const payload = params.inputs || (params.url ? [{ url: params.url }] : [])

  const endpoints: string[] = []
  if (activeCollectorId.startsWith("gd_")) {
    endpoints.push(
      `${config.baseUrl}/datasets/v3/trigger?dataset_id=${encodeURIComponent(activeCollectorId)}`,
      `${config.baseUrl}/dca/trigger?collector=${encodeURIComponent(activeCollectorId)}&queue_next=1`
    )
  } else {
    endpoints.push(
      `${config.baseUrl}/dca/trigger?collector=${encodeURIComponent(activeCollectorId)}&queue_next=1`,
      `${config.baseUrl}/datasets/v3/trigger?dataset_id=${encodeURIComponent(activeCollectorId)}`
    )
  }

  let lastErrorMsg = ""

  for (const endpoint of endpoints) {
    try {
      // 1. Standard Bearer Authorization Header
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        return (await response.json()) as BrightDataTriggerResponse
      }

      // 2. Query Parameter Auth Fallback if 401 Returned
      if (response.status === 401) {
        const altEndpoint = endpoint.includes("?")
          ? `${endpoint}&api_token=${encodeURIComponent(config.apiKey)}`
          : `${endpoint}?api_token=${encodeURIComponent(config.apiKey)}`

        const altResponse = await fetch(altEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (altResponse.ok) {
          return (await altResponse.json()) as BrightDataTriggerResponse
        }
      }

      const errorBody = await response.text().catch(() => "No error body")
      lastErrorMsg = `Bright Data API HTTP ${response.status}: ${errorBody}`
    } catch (err) {
      lastErrorMsg = err instanceof Error ? err.message : String(err)
    }
  }

  throw sanitizeError(new Error(lastErrorMsg), config.apiKey)
}

/**
 * Polls Bright Data for the status and result of a triggered collection snapshot.
 */
export async function pollBrightDataResult(
  snapshotId: string,
  options?: BrightDataPollOptions
): Promise<BrightDataProduct[]> {
  const config = getBrightDataConfig()
  const intervalMs = options?.intervalMs ?? 3000
  const maxAttempts = options?.maxAttempts ?? 20
  const timeoutMs = options?.timeoutMs ?? 60000

  const startTime = Date.now()
  const cleanId = cleanEnvString(snapshotId)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Bright Data polling timed out after ${Math.round(timeoutMs / 1000)} seconds for snapshot ${cleanId}.`)
    }

    try {
      // Endpoint candidate 1: DCA Result (/dca/get_result)
      const dcaEndpoint = `${config.baseUrl}/dca/get_result?snapshot_id=${encodeURIComponent(cleanId)}`
      const response = await fetch(dcaEndpoint, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (response.status === 202) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
        continue
      }

      if (response.status === 200) {
        const bodyText = await response.text()
        let parsed: unknown
        try {
          parsed = JSON.parse(bodyText)
        } catch {
          if (bodyText.trim()) {
            return [{ product_name: "Extracted Item", raw_output: bodyText }]
          }
          throw new Error("Bright Data response could not be parsed as JSON.")
        }

        if (Array.isArray(parsed)) {
          return parsed as BrightDataProduct[]
        }

        if (parsed && typeof parsed === "object") {
          const resObj = parsed as Record<string, unknown>

          if (Array.isArray(resObj.records)) {
            return resObj.records as BrightDataProduct[]
          }

          if (Array.isArray(resObj.data)) {
            return resObj.data as BrightDataProduct[]
          }

          const statusStr = String(resObj.status || "").toLowerCase()
          if (["running", "building", "collecting", "queued", "pending"].includes(statusStr)) {
            await new Promise((resolve) => setTimeout(resolve, intervalMs))
            continue
          }

          if (statusStr === "failed") {
            throw new Error(`Bright Data collection failed for snapshot ${cleanId}: ${String(resObj.error || "Unknown error")}`)
          }

          return [resObj as BrightDataProduct]
        }
      }

      // Endpoint candidate 2: Datasets v3 progress & snapshot retrieval
      const v3ProgressUrl = `${config.baseUrl}/datasets/v3/progress/${encodeURIComponent(cleanId)}`
      const v3ProgRes = await fetch(v3ProgressUrl, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (v3ProgRes.ok) {
        const v3Prog = (await v3ProgRes.json()) as { status?: string; error?: string }
        const st = (v3Prog.status || "").toLowerCase()

        if (st === "ready") {
          const v3DataUrl = `${config.baseUrl}/datasets/v3/snapshot/${encodeURIComponent(cleanId)}?format=json`
          const v3DataRes = await fetch(v3DataUrl, {
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
            },
          })

          if (v3DataRes.ok) {
            const v3Data = (await v3DataRes.json()) as unknown
            if (Array.isArray(v3Data)) {
              return v3Data as BrightDataProduct[]
            }
            if (v3Data && typeof v3Data === "object") {
              return [v3Data as BrightDataProduct]
            }
          }
        } else if (["running", "building", "collecting", "queued", "pending"].includes(st)) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs))
          continue
        } else if (st === "failed") {
          throw new Error(`Bright Data collection failed for snapshot ${cleanId}: ${v3Prog.error || "Failed"}`)
        }
      }
    } catch (err) {
      if (attempt === maxAttempts) {
        throw sanitizeError(err, config.apiKey)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Bright Data polling exceeded maximum attempts (${maxAttempts}) for snapshot ${cleanId}.`)
}

export type ScrapeExecutionResult = {
  snapshotId?: string
  source: "live_brightdata" | "payload_mapping"
  count: number
  data: Product[]
}

/**
 * Higher-level workflow to trigger collection, poll for completion, and map output to Product domain models.
 */
export async function executeBrightDataScrape(params: {
  url: string
  collectorId?: string
  pollOptions?: BrightDataPollOptions
}): Promise<ScrapeExecutionResult> {
  const triggerRes = await triggerBrightDataScrape({
    url: params.url,
    collectorId: params.collectorId,
  })

  let rawItems: BrightDataProduct[] | null = null
  if (Array.isArray(triggerRes)) {
    rawItems = triggerRes as BrightDataProduct[]
  } else if (Array.isArray(triggerRes.records)) {
    rawItems = triggerRes.records
  } else if (Array.isArray(triggerRes.data)) {
    rawItems = triggerRes.data
  }

  const snapshotId =
    triggerRes.snapshot_id || triggerRes.collection_id || triggerRes.job_id || triggerRes.id

  if (rawItems && rawItems.length > 0) {
    const products = rawItems.map((item) => mapBrightDataToShelfGuardProduct(item))
    return {
      snapshotId: snapshotId ? String(snapshotId) : undefined,
      source: "live_brightdata",
      count: products.length,
      data: products,
    }
  }

  if (!snapshotId) {
    throw new Error("Bright Data trigger did not return a valid snapshot ID or synchronous dataset payload.")
  }

  const polledItems = await pollBrightDataResult(String(snapshotId), params.pollOptions)
  const products = polledItems.map((item) => mapBrightDataToShelfGuardProduct(item))

  return {
    snapshotId: String(snapshotId),
    source: "live_brightdata",
    count: products.length,
    data: products,
  }
}


