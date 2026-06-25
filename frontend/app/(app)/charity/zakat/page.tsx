import { PageHeader } from "@/components/ui/PageHeader"
import { CalculateZakatForm } from "./CalculateZakatForm"

export const dynamic = "force-dynamic"

export default async function ZakatCalculatePage() {
  return (
    <div>
      <PageHeader title="Calculate Zakat" subtitle="Charity" showBack />
      <div className="px-4 py-3 lg:px-6 lg:py-6 mx-auto">
        <CalculateZakatForm />
      </div>
    </div>
  )
}
