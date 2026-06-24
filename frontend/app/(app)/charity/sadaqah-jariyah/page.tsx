import Link from "next/link"
import { getSadaqahJariyahList, getFoundations } from "@/utils/api"
import { formatAmount, formatDate } from "@/utils/helpers"
import { CreateSadaqahJariyahForm } from "./CreateSadaqahJariyahForm"
import { ToggleDonationButton } from "./ToggleDonationButton"

export const dynamic = "force-dynamic"

export default async function SadaqahJariyahPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === "create" ? "create" : "list"

  const [donations, foundations] = await Promise.all([
    activeTab === "list" ? getSadaqahJariyahList().catch(() => []) : [],
    activeTab === "create" ? getFoundations().catch(() => []) : [],
  ])

  const list = Array.isArray(donations) ? donations : []

  const TABS = [
    { key: "list", label: "My Donations" },
    { key: "create", label: "New Donation" },
  ] as const

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="bg-white border-b border-sage-mid px-6 -mx-4 lg:-mx-8 -mt-6 mb-6 py-4 lg:px-8">
        <Link href="/charity" className="text-navy-muted text-sm hover:underline">&larr; Charity</Link>
        <h1 className="text-navy font-bold text-lg">Sadaqah Jariyah</h1>
        <p className="text-navy-muted text-xs">Recurring charitable donations</p>
      </div>

      <div className="flex border-b border-sage-mid mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/charity/sadaqah-jariyah?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-teal text-teal"
                : "border-transparent text-navy-muted hover:text-navy"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "list" && (
        <div className="bg-white border border-sage-mid divide-y divide-sage-mid">
          {list.length === 0 ? (
            <div className="px-5 py-8 text-center text-navy-muted text-sm">
              No recurring donations yet.
            </div>
          ) : (
            list.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-navy font-medium text-sm">
                    {formatAmount(d.amount)} / {d.frequency}
                  </span>
                  {d.cause && <p className="text-xs text-navy-muted">{d.cause}</p>}
                  {d.recipient_name && <p className="text-xs text-navy-muted">To: {d.recipient_name}</p>}
                  {d.next_due_date && (
                    <p className="text-xs text-navy-muted">Next: {formatDate(d.next_due_date)}</p>
                  )}
                  <p className="text-xs text-navy-muted">Total: {formatAmount(d.total_donated)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${d.is_active ? "text-teal" : "text-navy-muted"}`}
                  >
                    {d.is_active ? "Active" : "Paused"}
                  </span>
                  <ToggleDonationButton donationId={d.id} isActive={d.is_active} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "create" && <CreateSadaqahJariyahForm foundations={foundations} />}
    </div>
  )
}
