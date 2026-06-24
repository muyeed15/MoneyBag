import Link from "next/link"
import { Heart, Calculator, Clock, HandHelping, RefreshCw, List } from "lucide-react"

const SECTIONS = [
  { href: "/charity/zakat", icon: Calculator, label: "Calculate Zakat", desc: "Calculate zakat on your wealth" },
  { href: "/charity/zakat?tab=pay", icon: Heart, label: "Pay Zakat", desc: "Pay zakat to verified foundations" },
  { href: "/charity/zakat?tab=history", icon: Clock, label: "Zakat History", desc: "View your past zakat payments" },
  { href: "/charity/sadaqah", icon: HandHelping, label: "Give Sadaqah", desc: "Make voluntary donations" },
  { href: "/charity/hawl", icon: RefreshCw, label: "Hawl Tracking", desc: "Track your zakat eligibility" },
  { href: "/charity/sadaqah-jariyah", icon: List, label: "Sadaqah Jariyah", desc: "Manage recurring donations" },
]

export default function CharityPage() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="bg-white border-b border-sage-mid px-6 -mx-4 lg:-mx-8 -mt-6 mb-6 py-4 lg:px-8">
        <h1 className="text-navy font-bold text-lg">Charity</h1>
        <p className="text-navy-muted text-sm">Zakat, Sadaqah &amp; Hawl tracking</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white border border-sage-mid p-5 hover:border-teal transition-colors"
            >
              <Icon className="h-6 w-6 text-teal mb-3" />
              <h3 className="text-navy font-semibold text-sm">{s.label}</h3>
              <p className="text-navy-muted text-xs mt-1">{s.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
