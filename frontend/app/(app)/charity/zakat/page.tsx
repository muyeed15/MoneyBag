import Link from "next/link"
import { getZakatHistory, getFoundations } from "@/utils/api"
import { formatAmount, formatDate } from "@/utils/helpers"
import { PageHeader } from "@/components/ui/PageHeader"
import { CalculateZakatForm } from "./CalculateZakatForm"
import { PayZakatForm } from "./PayZakatForm"

export const dynamic = "force-dynamic"

export default async function ZakatPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === "pay" ? "pay" : tab === "history" ? "history" : "calculate"

  const [zakatPayments, foundations] = await Promise.all([
    activeTab === "history" ? getZakatHistory().catch(() => []) : [],
    activeTab === "pay" ? getFoundations().catch(() => []) : [],
  ])

  const paymentList = Array.isArray(zakatPayments) ? zakatPayments : []
  const foundationList = Array.isArray(foundations) ? foundations : []

  const TABS = [
    { key: "calculate", label: "Calculate" },
    { key: "pay", label: "Pay" },
    { key: "history", label: "History" },
  ] as const

  return (
    <div>
      <PageHeader title="Zakat" subtitle="Charity" showBack />
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">

      <div className="flex border-b border-sage-mid mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/charity/zakat?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-navy text-navy"
                : "border-transparent text-navy-muted hover:text-navy"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "calculate" && <CalculateZakatForm />}
      {activeTab === "pay" && <PayZakatForm foundations={foundationList} />}
      {activeTab === "history" && (
        <div className="bg-white border border-sage-mid divide-y divide-sage-mid rounded-xl">
          {paymentList.length === 0 ? (
            <div className="px-5 py-8 text-center text-navy-muted text-sm">No zakat payments yet.</div>
          ) : (
            paymentList.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-navy font-medium text-sm">{formatAmount(p.amount)}</span>
                  {p.recipient_name && <p className="text-xs text-navy-muted">To: {p.recipient_name}</p>}
                </div>
                <span className="text-xs text-navy-muted">{formatDate(p.paid_at)}</span>
              </div>
            ))
          )}
        </div>
      )}
      </div>
    </div>
  )
}
