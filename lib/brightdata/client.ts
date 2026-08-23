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
 * Cleans string input by trimming whitespace and removing surrounding quotation marks.
 */
function cleanEnvString(val?: string): string {
  if (!val) return ""
  return val.trim().replace(/^["']|["']$/g, "").trim()
}

/**
 * Cleans a collector ID string, ensuring any query parameters like &queue_next=1 are removed.
 */
function cleanCollectorId(id?: string): string {
  const cleaned = cleanEnvString(id)
  if (!cleaned) return ""
  return cleaned.split(/[?&]/)[0].trim()
}

/**
 * Retrieves Bright Data configuration strictly from server environment variables.
 */
export function getBrightDataConfig(): BrightDataConfig {
  const apiKey = cleanEnvString(process.env.BRIGHTDATA_API_KEY)
  const rawCollectorId = cleanEnvString(process.env.BRIGHTDATA_COLLECTOR_ID)
  const collectorId = cleanCollectorId(rawCollectorId)
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
 * Dispatches a trigger request to Bright Data's Scraper Studio (DCA API) endpoint.
 * Official Batch Trigger format for collector c_mt4maubd1v7q5h4l1e:
 * POST /dca/trigger?collector=c_mt4maubd1v7q5h4l1e&queue_next=1
 * Authorization: Bearer <BRIGHTDATA_API_KEY>
 * Content-Type: application/json
 * Body: [{"url": inputUrl}]
 */
export async function triggerBrightDataScrape(
  params: TriggerScrapeParams
): Promise<BrightDataTriggerResponse> {
  const config = getBrightDataConfig()
  const activeCollectorId = cleanCollectorId(params.collectorId || config.collectorId)
  const payload = params.inputs || (params.url ? [{ url: params.url }] : [])

  const endpoint = `${config.baseUrl}/dca/trigger?collector=${encodeURIComponent(activeCollectorId)}&queue_next=1`

  console.log(`[BrightData] Collector ID in use: ${activeCollectorId}`)
  console.log(`[BrightData] Trigger URL: ${endpoint}`)

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log(`[BrightData] Trigger HTTP status: ${response.status}`)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "No error body")
      console.log(`[BrightData] Response body: ${errorBody}`)
      throw new Error(`Bright Data API HTTP ${response.status}: ${errorBody}`)
    }

    const bodyText = await response.text()
    console.log(`[BrightData] Response body: ${bodyText}`)

    let data: BrightDataTriggerResponse
    try {
      data = JSON.parse(bodyText) as BrightDataTriggerResponse
    } catch {
      throw new Error(`Failed to parse Bright Data trigger response as JSON: ${bodyText}`)
    }

    return data
  } catch (err) {
    throw sanitizeError(err, config.apiKey)
  }
}


/**
 * Polls Bright Data for the results of a triggered collection using the official Scraper Studio dataset endpoint:
 * GET /dca/dataset?id=COLLECTION_ID
 * Authorization: Bearer <BRIGHTDATA_API_KEY>
 */
export async function pollBrightDataResult(
  collectionId: string,
  options?: BrightDataPollOptions
): Promise<BrightDataProduct[]> {
  const config = getBrightDataConfig()
  const intervalMs = options?.intervalMs ?? 2000
  const maxAttempts = options?.maxAttempts ?? 30
  const timeoutMs = options?.timeoutMs ?? 150000

  const startTime = Date.now()
  const cleanId = cleanEnvString(collectionId)
  const endpoint = `${config.baseUrl}/dca/dataset?id=${encodeURIComponent(cleanId)}`

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Bright Data polling timed out after ${Math.round(timeoutMs / 1000)}s for collection ${cleanId}.`)
    }

    console.log(`[BrightData] Polling collection...`)

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (response.status === 200) {
        const bodyText = await response.text()
        let parsed: unknown
        try {
          parsed = JSON.parse(bodyText)
        } catch {
          if (bodyText.trim()) {
            console.log(`[BrightData] Raw result text received for collection ${cleanId}.`)
            return [{ product_name: "Extracted Item", raw_output: bodyText }]
          }
          throw new Error("Bright Data response could not be parsed as JSON.")
        }

        // Check if response is a JSON array -> SUCCESS
        if (Array.isArray(parsed)) {
          console.log(`[BrightData] Collection ready: ${parsed.length} records`)
          return parsed as BrightDataProduct[]
        }

        if (parsed && typeof parsed === "object") {
          const resObj = parsed as Record<string, unknown>

          if (Array.isArray(resObj.records)) {
            console.log(`[BrightData] Collection ready: ${resObj.records.length} records`)
            return resObj.records as BrightDataProduct[]
          }

          if (Array.isArray(resObj.data)) {
            console.log(`[BrightData] Collection ready: ${resObj.data.length} records`)
            return resObj.data as BrightDataProduct[]
          }

          const statusStr = String(resObj.status || "").toLowerCase()
          if (["building", "collecting", "queued", "pending", "running"].includes(statusStr)) {
            // Collection still building/processing, wait and poll again
            await new Promise((resolve) => setTimeout(resolve, intervalMs))
            continue
          }

          if (statusStr === "failed") {
            throw new Error(`Bright Data collection failed for collection ${cleanId}: ${String(resObj.error || "Failed")}`)
          }

          // Single record object returned
          console.log(`[BrightData] Collection ready: 1 record`)
          return [resObj as BrightDataProduct]
        }
      } else if (response.status === 202) {
        // HTTP 202 Accepted - Still building
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
        continue
      } else {
        const errText = await response.text().catch(() => "")
        console.log(`[BrightData] Polling status HTTP ${response.status}: ${errText}`)
      }
    } catch (err) {
      if (attempt === maxAttempts) {
        throw sanitizeError(err, config.apiKey)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Bright Data polling exceeded maximum attempts (${maxAttempts}) for collection ${cleanId}.`)
}

export type ScrapeExecutionResult = {
  snapshotId?: string
  source: "live_brightdata" | "payload_mapping"
  count: number
  data: Product[]
}

/**
 * Higher-level workflow to trigger collection via POST /dca/trigger,
 * poll for completion via GET /dca/dataset?id=COLLECTION_ID,
 * and map output to Product domain models.
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

  // Check if payload arrived synchronously in trigger response
  let rawItems: BrightDataProduct[] | null = null
  if (Array.isArray(triggerRes)) {
    rawItems = triggerRes as BrightDataProduct[]
  } else if (Array.isArray(triggerRes.records)) {
    rawItems = triggerRes.records
  } else if (Array.isArray(triggerRes.data)) {
    rawItems = triggerRes.data
  }

  const collectionId =
    triggerRes.collection_id || triggerRes.response_id || triggerRes.snapshot_id || triggerRes.job_id || triggerRes.id

  if (rawItems && rawItems.length > 0) {
    console.log(`[BrightData] Synchronous collection ready: ${rawItems.length} records`)
    const products = rawItems.map((item) => mapBrightDataToShelfGuardProduct(item))
    return {
      snapshotId: collectionId ? String(collectionId) : undefined,
      source: "live_brightdata",
      count: products.length,
      data: products,
    }
  }

  if (!collectionId) {
    throw new Error("Bright Data trigger did not return a valid collection_id or synchronous payload.")
  }

  console.log(`[BrightData] Triggered collection: ${collectionId}`)

  const polledItems = await pollBrightDataResult(String(collectionId), params.pollOptions)
  const products = polledItems.map((item) => mapBrightDataToShelfGuardProduct(item))

  return {
    snapshotId: String(collectionId),
    source: "live_brightdata",
    count: products.length,
    data: products,
  }
}




