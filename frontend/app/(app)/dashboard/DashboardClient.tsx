"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, Store, CreditCard, Receipt } from "lucide-react";
import type { Wallet, Transaction, Notification } from "@/utils/api";
import { formatAmount } from "@/utils/helpers";
import { TOAST_DURATION_MS } from "@/utils/swr";
import { ToastStack, type Toast } from "@/components/ui/Toast";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { PageTransition } from "@/components/ui/PageTransition";

const ACTIONS = [
  {
    label: "Send Money",
    icon: ArrowUpRight,
    href: "/send",
    bg: "bg-orange",
    text: "text-white",
  },
  {
    label: "Pay Merchant",
    icon: Store,
    href: "/pay",
    bg: "bg-teal",
    text: "text-white",
  },
  {
    label: "My Cards",
    icon: CreditCard,
    href: "/cards",
    bg: "bg-navy",
    text: "text-white",
  },
  {
    label: "Transactions",
    icon: Receipt,
    href: "/transactions",
    bg: "bg-sage-mid",
    text: "text-navy",
  },
];

type Props = {
  initialWallet: Wallet;
  initialTransactions: Transaction[];
  initialNotifications: Notification[];
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
  initialNotifications,
}: Props): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIds = useRef(new Set(initialNotifications.map((n) => n.id)));

  const { data: wallet = initialWallet } = useSWR<Wallet>("/api/wallet", {
    fallbackData: initialWallet,
  });
  const { data: rawTransactions = initialTransactions } = useSWR<Transaction[]>(
    "/api/transactions",
    { fallbackData: initialTransactions },
  );
  const { data: notifications = initialNotifications } = useSWR<Notification[]>(
    "/api/notifications",
    { fallbackData: initialNotifications },
  );

  const transactions = useMemo(
    () => sortDesc(rawTransactions),
    [rawTransactions],
  );
  const myPhone = wallet.user_phone;
  const active = wallet.status === "active";
  const recentTx = useMemo(() => transactions.slice(0, 6), [transactions]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  useEffect(() => {
    notifications
      .filter((n) => !seenIds.current.has(n.id))
      .forEach((n) => {
        seenIds.current.add(n.id);
        pushToast(n.message);
      });
  }, [notifications, pushToast]);

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <PageTransition>
        <div className="bg-white border-b border-sage-mid px-6 h-16 flex items-center">
          <div>
            <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
              Overview
            </p>
            <h1 className="text-navy font-bold text-lg leading-tight mt-0.5">
              Dashboard
            </h1>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-5 space-y-5 max-w-5xl mx-auto">
          {/* Mobile */}
          <div className="lg:hidden space-y-5">
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

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-muted mb-3">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ACTIONS.map(({ label, icon: Icon, href, bg, text }) => (
                  <Link
                    key={label}
                    href={active ? href : "#"}
                    aria-disabled={!active}
                    className={`flex items-center gap-3 ${bg} ${text} px-4 py-4 transition-opacity active:opacity-70 ${!active ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex border border-sage-mid overflow-hidden">
            <div className="bg-teal text-white p-8 w-2/5 flex flex-col justify-between">
              <div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Available Balance
                </p>
                <p className="text-5xl font-bold tracking-tight leading-none tabular-nums">
                  {formatAmount(wallet.balance)}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-sm">
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

            <div className="w-3/5 grid grid-cols-2 border-l border-sage-mid">
              {ACTIONS.map(({ label, icon: Icon, href, bg, text }, i) => (
                <Link
                  key={label}
                  href={active ? href : "#"}
                  aria-disabled={!active}
                  className={`flex items-center gap-3 ${bg} ${text} px-5
                    ${i % 2 === 0 ? "border-r border-white/10" : ""}
                    ${i < 2 ? "border-b border-white/10" : ""}
                    transition-opacity active:opacity-70
                    ${!active ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">{label}</span>
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

            <div className="bg-white border border-sage-mid divide-y divide-sage-mid overflow-hidden">
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
    </>
  );
}
