"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowUpRight, Store, CreditCard, Receipt, Landmark,
  Heart, QrCode, Bell,
} from "lucide-react";
import type { Wallet, Transaction, Notification, PaginatedResponse } from "@/types";
import { formatAmount } from "@/utils/helpers";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { PageTransition } from "@/components/ui/PageTransition";


const ACTIONS = [
  { label: "Send Money", icon: ArrowUpRight, href: "/send", bg: "bg-teal", text: "text-white" },
  { label: "Receive", icon: QrCode, href: "/receive", bg: "bg-teal", text: "text-white" },
  { label: "Pay Merchant", icon: Store, href: "/pay", bg: "bg-teal", text: "text-white" },
  { label: "Savings", icon: Landmark, href: "/savings", bg: "bg-teal", text: "text-white" },
  { label: "Charity", icon: Heart, href: "/charity", bg: "bg-teal", text: "text-white" },
  { label: "My Cards", icon: CreditCard, href: "/cards", bg: "bg-teal", text: "text-white" },
  { label: "Alerts", icon: Bell, href: "/notifications", bg: "bg-teal", text: "text-white" },
  { label: "History", icon: Receipt, href: "/transactions", bg: "bg-teal", text: "text-white" },
];

type Props = {
  initialWallet: Wallet;
  initialTransactions: Transaction[];
  svgDataUri?: string;
};

function sortDesc(txs: Transaction[]): Transaction[] {
  return [...txs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export default function DashboardClient({
  initialWallet,
  initialTransactions,
  svgDataUri,
}: Props): React.ReactElement {
  const { data: wallet = initialWallet } = useSWR<Wallet>("/api/wallet", {
    fallbackData: initialWallet,
    refreshInterval: 0,
  });
  const { data: notifPage } = useSWR<PaginatedResponse<Notification>>("/api/notifications?page=1", { refreshInterval: 0 });
  const unreadCount = notifPage?.results.filter((n) => !n.is_read).length ?? 0;
  const { data: txPage } = useSWR<PaginatedResponse<Transaction>>("/api/transactions?page=1", {
    refreshInterval: 0,
  });
  const rawTransactions = txPage?.results ?? initialTransactions;

  const transactions = useMemo(
    () => sortDesc(rawTransactions),
    [rawTransactions],
  );
  const myPhone = wallet.user_phone;
  const active = wallet.status === "active";
  const recentTx = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <PageTransition>
      <div className="px-4 lg:px-8 py-5 space-y-5 max-w-5xl mx-auto">
        {/* Balance card */}
        <div className="bg-teal text-white py-8 pl-5 pr-6 sm:py-10 sm:pl-8 sm:pr-10 relative overflow-hidden aspect-[3/1] sm:aspect-[5/1] rounded-xl">
          {svgDataUri && (
            <img src={svgDataUri} alt="" className="absolute top-0 left-0 w-full h-full object-cover object-top -scale-x-100 pointer-events-none" />
          )}
          <div className="relative flex flex-col justify-center h-full">
            <p className="text-white/80 text-xs font-medium tracking-wide mb-1">
              Balance
            </p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight leading-none tabular-nums">
              {formatAmount(wallet.balance)}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-muted mb-3">
            Services
          </p>
          <div className="grid grid-cols-4 gap-3">
            {ACTIONS.map(({ label, icon: Icon, href, bg, text }) => (
              <Link
                key={label}
                href={active ? href : "#"}
                aria-disabled={!active}
                className={`flex flex-col items-center justify-center gap-1.5 ${bg} ${text} px-2 py-4 rounded-xl transition-opacity active:opacity-70 h-full overflow-hidden ${!active ? "opacity-40 pointer-events-none" : ""}`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  {label === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-teal text-white text-[7px] font-bold flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-center whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-muted">
              Recent Transactions
            </p>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-navy active:opacity-50 transition-opacity"
            >
              View All →
            </Link>
          </div>

          <div className="bg-white border border-sage-mid divide-y divide-sage-mid rounded-xl">
            {recentTx.length === 0 ? (
              <p className="text-sm text-navy-muted text-center py-10">
                No transactions yet.
              </p>
            ) : (
              recentTx.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  myPhone={myPhone}
                  relativeTime
                />
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
