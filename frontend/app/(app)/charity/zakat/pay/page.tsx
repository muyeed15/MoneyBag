import { getFoundations } from "@/utils/api"
import { PageHeader } from "@/components/ui/PageHeader"
import { PayZakatForm } from "../PayZakatForm"

export const dynamic = "force-dynamic"

export default async function ZakatPayPage() {
  const foundations = await getFoundations().catch(() => [])
  const foundationList = Array.isArray(foundations) ? foundations : []

  return (
    <div>
      <PageHeader title="Pay Zakat" subtitle="Charity" showBack />
      <div className="px-4 py-3 lg:px-6 lg:py-6 mx-auto">
        <PayZakatForm foundations={foundationList} />
      </div>
    </div>
  )
}
