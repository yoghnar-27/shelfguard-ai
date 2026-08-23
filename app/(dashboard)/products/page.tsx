"use client"

import { useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { LiveProductManager } from "@/components/products/live-product-manager"
import { ProductGrid } from "@/components/products/product-grid"
import type { Product } from "@/lib/mock/types"

export default function ProductsPage() {
  const [liveProduct, setLiveProduct] = useState<Product | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Products"
        title="Product Intelligence Catalog"
        description="Monitor competitor SKUs across Indian marketplaces with live Bright Data extraction and real-time parameter tracking."
      />
      <LiveProductManager onLiveProductLoaded={setLiveProduct} />
      <ProductGrid liveProduct={liveProduct} />
    </div>
  )
}

