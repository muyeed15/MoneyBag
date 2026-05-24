import { getMe, getWallet } from "@/utils/api";
import { PageTransition } from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/actions";
import { formatAmount, formatDate, getInitials } from "@/utils/helpers";

export default async function ProfilePage() {
  const [user, wallet] = await Promise.all([getMe(), getWallet()]);

  return (
    <PageTransition>
      <div className="bg-white border-b border-sage-mid px-6 h-16 flex flex-col justify-center">
        <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
          Account
        </p>
        <h1 className="text-navy font-bold text-lg leading-tight mt-0.5">
          Profile
        </h1>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto space-y-5">
        {/* Identity block */}
        <div className="bg-teal text-white px-6 py-5 flex items-center gap-5">
          <div className="h-14 w-14 bg-white/20 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user.full_name)}
          </div>
          <div>
            <p className="text-lg font-bold">{user.full_name}</p>
            <p className="text-white/70 text-sm">{user.phone}</p>
            <div className="flex gap-2 mt-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 ${user.is_verified ? "bg-white/20 text-white" : "bg-amber-400/30 text-amber-200"}`}
              >
                {user.is_verified ? "VERIFIED" : "UNVERIFIED"}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 ${user.is_active ? "bg-white/20 text-white" : "bg-red-400/30 text-red-200"}`}
              >
                {user.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Details table */}
        <div className="bg-white border border-sage-mid">
          <div className="px-4 py-2 bg-sage border-b border-sage-mid">
            <p className="text-xs font-semibold uppercase tracking-widest text-navy-muted">
              Personal Information
            </p>
          </div>
          {[
            { label: "Full Name", value: user.full_name },
            { label: "Phone Number", value: user.phone },
            { label: "NID Number", value: user.nid },
            { label: "Member Since", value: formatDate(user.created_at) },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`flex px-4 py-3 ${i < arr.length - 1 ? "border-b border-sage-mid" : ""}`}
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-navy-muted w-36 shrink-0 mt-0.5">
                {label}
              </span>
              <span className="text-sm text-navy font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Wallet details */}
        <div className="bg-white border border-sage-mid">
          <div className="px-4 py-2 bg-sage border-b border-sage-mid">
            <p className="text-xs font-semibold uppercase tracking-widest text-navy-muted">
              Wallet
            </p>
          </div>
          {[
            { label: "Balance", value: formatAmount(wallet.balance) },
            { label: "Daily Limit", value: formatAmount(wallet.daily_limit) },
            { label: "Status", value: wallet.status.toUpperCase() },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`flex px-4 py-3 ${i < arr.length - 1 ? "border-b border-sage-mid" : ""}`}
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-navy-muted w-36 shrink-0 mt-0.5">
                {label}
              </span>
              <span
                className={`text-sm font-bold ${label === "Balance" ? "text-teal" : "text-navy"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="secondary"
            size="md"
            className="w-full"
          >
            Sign Out
          </Button>
        </form>
      </div>
    </PageTransition>
  );
}
