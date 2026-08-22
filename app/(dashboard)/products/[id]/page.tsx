import { PageHeader } from "@/components/dashboard/page-header"
import { ProductIntelligence } from "@/components/products/product-intelligence"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Product intelligence"
        title="Single-SKU command view"
        description="Price, availability, classified changes, and recommendations for one competitor product."
      />
      <ProductIntelligence id={id} />
    </div>
  )
}
