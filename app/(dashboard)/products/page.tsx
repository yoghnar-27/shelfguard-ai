import { PageHeader } from "@/components/dashboard/page-header"
import { ProductGrid } from "@/components/products/product-grid"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Products"
        title="Product intelligence"
        description="Open a SKU for price history, stock, classified changes, and opportunity indicators."
      />
      <ProductGrid />
    </div>
  )
}
