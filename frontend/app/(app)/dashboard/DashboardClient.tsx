"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ArrowUpRight, Store, CreditCard, Receipt, Landmark,
  Heart, QrCode, User,
} from "lucide-react";
import type { Wallet, Transaction, PaginatedResponse } from "@/types";
import { formatAmount } from "@/utils/helpers";
import { TransactionCard } from "@/components/ui/TransactionCard";


const ACTIONS = [
  { label: "Send Money", icon: ArrowUpRight, href: "/send", bg: "bg-teal", text: "text-white" },
  { label: "Receive", icon: QrCode, href: "/receive", bg: "bg-teal", text: "text-white" },
  { label: "Pay Merchant", icon: Store, href: "/pay", bg: "bg-teal", text: "text-white" },
  { label: "Savings", icon: Landmark, href: "/savings", bg: "bg-teal", text: "text-white" },
  { label: "Charity", icon: Heart, href: "/charity", bg: "bg-teal", text: "text-white" },
  { label: "My Cards", icon: CreditCard, href: "/cards", bg: "bg-teal", text: "text-white" },
  { label: "Profile", icon: User, href: "/profile", bg: "bg-teal", text: "text-white" },
  { label: "History", icon: Receipt, href: "/transactions", bg: "bg-teal", text: "text-white" },
];

type Props = {
  initialWallet: Wallet;
  initialTransactions: Transaction[];
  svgDataUri?: string;
  fullName?: string;
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
  fullName,
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
  const [gridRef] = useAutoAnimate();
  const [listRef] = useAutoAnimate();

  return (
    <div>
      <div className="px-4 py-4 lg:px-6 lg:py-6 mx-auto space-y-5">
        {/* Balance card */}
        <div className="bg-teal text-white py-8 pl-5 pr-6 sm:py-10 sm:pl-8 sm:pr-10 relative overflow-hidden aspect-[3/1] sm:aspect-[5/1] rounded-xl">
          {svgDataUri && (
            <img src={svgDataUri} alt="" className="absolute top-0 left-0 w-full h-full object-cover object-top pointer-events-none" />
          )}
          <div className="relative flex flex-col justify-center h-full">
            {fullName && (
              <p className="text-white/90 text-base sm:text-lg font-semibold mb-1">
                Welcome, {fullName}
              </p>
            )}
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
          <div ref={gridRef} className="grid grid-cols-4 gap-3">
            {ACTIONS.map(({ label, icon: Icon, href, bg, text }) => (
              <Link
                key={label}
                href={active ? href : "#"}
                aria-disabled={!active}
                className={`flex flex-col items-center justify-center gap-1.5 ${bg} ${text} px-2 py-4 rounded-xl h-full overflow-hidden ${!active ? "opacity-40 pointer-events-none" : ""}`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
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

          <div ref={listRef} className="bg-white border border-sage-mid divide-y divide-sage-mid rounded-xl">
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
      </div>
  );
}
