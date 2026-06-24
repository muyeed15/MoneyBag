"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowUpRight, Store, CreditCard, Receipt, Landmark,
  Heart, QrCode, ScanLine,
} from "lucide-react";
import type { Wallet, Transaction, PaginatedResponse } from "@/types";
import { formatAmount } from "@/utils/helpers";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { PageTransition } from "@/components/ui/PageTransition";

const ACTIONS = [
  { label: "Send Money", icon: ArrowUpRight, href: "/send", bg: "bg-orange", text: "text-white" },
  { label: "Receive", icon: QrCode, href: "/receive", bg: "bg-navy", text: "text-white" },
  { label: "Scan & Pay", icon: ScanLine, href: "/send", bg: "bg-teal", text: "text-white" },
  { label: "Pay Merchant", icon: Store, href: "/pay", bg: "bg-sky-600", text: "text-white" },
  { label: "Savings", icon: Landmark, href: "/savings", bg: "bg-purple-600", text: "text-white" },
  { label: "Charity", icon: Heart, href: "/charity", bg: "bg-red-500", text: "text-white" },
  { label: "My Cards", icon: CreditCard, href: "/cards", bg: "bg-emerald-600", text: "text-white" },
  { label: "History", icon: Receipt, href: "/transactions", bg: "bg-sage-mid", text: "text-navy" },
];

type Props = {
  initialWallet: Wallet;
  initialTransactions: Transaction[];
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
}: Props): React.ReactElement {
  const { data: wallet = initialWallet } = useSWR<Wallet>("/api/wallet", {
    fallbackData: initialWallet,
    refreshInterval: 0,
  });
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
        <div className="bg-teal text-white p-6">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-2">
            Available Balance
          </p>
          <p className="text-4xl font-bold tracking-tight leading-none tabular-nums">
            {formatAmount(wallet.balance)}
          </p>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/20 text-sm">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Daily Limit
              </p>
              <p className="font-semibold mt-0.5">
                {formatAmount(wallet.daily_limit)}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2 py-1 ${active ? "bg-white/20 text-white" : "bg-red-500/30 text-red-200"}`}
            >
              {wallet.status.toUpperCase()}
            </span>
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
                className={`flex flex-col items-center justify-center gap-1.5 ${bg} ${text} px-2 py-4 transition-opacity active:opacity-70 ${!active ? "opacity-40 pointer-events-none" : ""}`}
              >
                <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
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
              className="text-xs font-semibold text-teal active:opacity-50 transition-opacity"
            >
              View All →
            </Link>
          </div>

          <div className="bg-white border border-sage-mid divide-y divide-sage-mid">
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
