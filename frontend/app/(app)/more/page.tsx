import Link from "next/link"
import { CreditCard, Heart, Receipt, User, LogOut, QrCode } from "lucide-react"
import { logoutAction } from "@/app/actions"
import { PageHeader } from "@/components/ui/PageHeader"

const ITEMS = [
  { href: "/profile", icon: User, label: "Profile", desc: "Account settings" },
  { href: "/receive", icon: QrCode, label: "Receive", desc: "Show QR code to receive money" },
  { href: "/cards", icon: CreditCard, label: "Cards", desc: "Manage virtual cards" },
  { href: "/charity", icon: Heart, label: "Charity", desc: "Zakat, Sadaqah & Hawl" },
  { href: "/transactions", icon: Receipt, label: "History", desc: "View all transactions" },
]

export default function MorePage() {
  return (
    <div>
      <PageHeader title="More Services" showBack />
      <div className="px-4 py-3 lg:px-6 lg:py-6 mx-auto max-w-lg">

      <div className="space-y-2">
        {ITEMS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 bg-white border border-sage-mid px-5 py-4 rounded-xl transition-colors active:bg-sage-mid/20"
          >
            <div className="h-10 w-10 bg-teal flex items-center justify-center shrink-0 rounded-lg">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy">{label}</p>
              <p className="text-xs text-navy-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="flex items-center gap-3 text-sm text-red-500 font-semibold w-full px-5 py-4 bg-white border border-sage-mid active:bg-red-50 transition-colors rounded-xl"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </form>
      </div>
    </div>
  )
}
