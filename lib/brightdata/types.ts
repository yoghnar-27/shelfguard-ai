/**
 * Raw product structure returned from Bright Data scrapers / collectors (e.g. Amazon / Marketplace schema).
 */
export type BrightDataPriceField =
  | number
  | string
  | {
      value?: number | string | null
      currency?: string | null
      amount?: number | string | null
    }
  | null

export type BrightDataProduct = {
  product_name?: string | null
  brand?: string | null
  product_id_or_asin?: string | null
  current_price?: BrightDataPriceField
  original_price?: BrightDataPriceField
  discount_percentage?: number | string | null
  currency?: string | null
  availability?: boolean | string | null
  stock_status?: string | null
  rating?: number | string | null
  review_count?: number | string | null
  seller?: string | null
  product_category?: string | null
  product_image_url?: string | null
  product_url?: string | null
  [key: string]: unknown
}

/**
 * Response structure from Bright Data collection/dataset API endpoints.
 */
export type BrightDataCollectionResponse = {
  snapshot_id?: string
  collection_id?: string
  job_id?: string
  id?: string
  status?: string
  records?: BrightDataProduct[]
  data?: BrightDataProduct[] | BrightDataProduct
  error?: string
  [key: string]: unknown
}

/**
 * Trigger response returned when initiating a scraper job.
 */
export type BrightDataTriggerResponse = {
  snapshot_id?: string
  collection_id?: string
  job_id?: string
  id?: string
  status?: string
  records?: BrightDataProduct[]
  data?: BrightDataProduct[] | BrightDataProduct
  [key: string]: unknown
}

/**
 * Polling configuration options for async dataset extraction.
 */
export type BrightDataPollOptions = {
  intervalMs?: number
  maxAttempts?: number
  timeoutMs?: number
}

/**
 * Input parameters accepted when triggering or requesting a scrape in ShelfGuard.
 */
export type ShelfGuardProductInput = {
  url?: string
  asin?: string
  category?: string
  competitor?: string
  customCollectorId?: string
}

