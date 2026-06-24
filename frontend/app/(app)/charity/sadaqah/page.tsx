import Link from "next/link"
import { getSadaqahHistory, getFoundations } from "@/utils/api"
import { formatAmount, formatDate } from "@/utils/helpers"
import { GiveSadaqahForm } from "./GiveSadaqahForm"

export const dynamic = "force-dynamic"

export default async function SadaqahPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === "history" ? "history" : "give"

  const [sadaqahList, foundations] = await Promise.all([
    activeTab === "history" ? getSadaqahHistory().catch(() => []) : [],
    activeTab === "give" ? getFoundations().catch(() => []) : [],
  ])

  const list = Array.isArray(sadaqahList) ? sadaqahList : []

  const TABS = [
    { key: "give", label: "Give" },
    { key: "history", label: "History" },
  ] as const

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="bg-white border-b border-sage-mid px-6 -mx-4 lg:-mx-8 -mt-6 mb-6 py-4 lg:px-8">
        <Link href="/charity" className="text-navy-muted text-sm hover:underline">&larr; Charity</Link>
        <h1 className="text-navy font-bold text-lg">Sadaqah</h1>
      </div>

      <div className="flex border-b border-sage-mid mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/charity/sadaqah?tab=${t.key}`}
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

      {activeTab === "give" && <GiveSadaqahForm foundations={foundations} />}
      {activeTab === "history" && (
        <div className="bg-white border border-sage-mid divide-y divide-sage-mid">
          {list.length === 0 ? (
            <div className="px-5 py-8 text-center text-navy-muted text-sm">No sadaqah donations yet.</div>
          ) : (
            list.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-navy font-medium text-sm">{formatAmount(d.amount)}</span>
                  {d.cause && <p className="text-xs text-navy-muted">{d.cause}</p>}
                  {d.recipient_name && <p className="text-xs text-navy-muted">To: {d.recipient_name}</p>}
                </div>
                <span className="text-xs text-navy-muted">{formatDate(d.given_at)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
