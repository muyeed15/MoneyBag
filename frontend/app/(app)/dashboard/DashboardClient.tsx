"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from "lucide-react";
import type { Wallet, Transaction, Notification } from "@/utils/api";
import { getTxMeta, formatAmount, formatRelativeTime } from "@/utils/helpers";
import { Badge } from "@/components/ui/Badge";
import { ToastStack, type Toast } from "@/components/ui/Toast";
import { PageTransition } from "@/components/ui/PageTransition";

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
  reversed: "neutral",
};

const ACTIONS = [
  {
    label: "Send Money",
    icon: ArrowUpRight,
    href: "/send",
    bg: "bg-orange",
    text: "text-white",
  },
  {
    label: "Cash Out",
    icon: Minus,
    href: "/send",
    bg: "bg-navy",
    text: "text-white",
  },
  {
    label: "Make Payment",
    icon: ArrowDownLeft,
    href: "/send",
    bg: "bg-teal",
    text: "text-white",
  },
  {
    label: "Fund Transfer",
    icon: Plus,
    href: "/send",
    bg: "bg-sage-mid",
    text: "text-navy",
  },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  initialWallet: Wallet;
  initialTransactions: Transaction[];
  initialNotifications: Notification[];
};

function sortDesc(txs: Transaction[]) {
  return [...txs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export default function DashboardClient({
  initialWallet,
  initialTransactions,
  initialNotifications,
}: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIds = useRef(new Set(initialNotifications.map((n) => n.id)));

  const { data: wallet = initialWallet } = useSWR<Wallet>(
    "/api/wallet",
    fetcher,
    {
      fallbackData: initialWallet,
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const { data: rawTransactions = initialTransactions } = useSWR<Transaction[]>(
    "/api/transactions",
    fetcher,
    {
      fallbackData: initialTransactions,
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const { data: notifications = initialNotifications } = useSWR<Notification[]>(
    "/api/notifications",
    fetcher,
    {
      fallbackData: initialNotifications,
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const transactions = sortDesc(rawTransactions);
  const myPhone = wallet.user_phone;
  const active = wallet.status === "active";
  const recentTx = transactions.slice(0, 6);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => dismissToast(id), 6000);
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
          {/* ── MOBILE ── */}
          <div className="lg:hidden space-y-5">
            <div className="bg-teal text-white p-6">
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-2">
                Available Balance
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={wallet.balance}
                  initial={{ opacity: 0.4, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-4xl font-bold tracking-tight leading-none tabular-nums"
                >
                  {formatAmount(wallet.balance)}
                </motion.p>
              </AnimatePresence>
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
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ACTIONS.map(({ label, icon: Icon, href, bg, text }) => (
                  <Link
                    key={label}
                    href={active ? href : "#"}
                    className={`flex items-center gap-3 ${bg} ${text} px-4 py-4 transition-opacity active:opacity-70 ${!active ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP ── */}
          <div className="hidden lg:flex border border-sage-mid overflow-hidden">
            <div className="bg-teal text-white p-8 w-2/5 flex flex-col justify-between">
              <div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Available Balance
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={wallet.balance}
                    initial={{ opacity: 0.4, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-5xl font-bold tracking-tight leading-none tabular-nums"
                  >
                    {formatAmount(wallet.balance)}
                  </motion.p>
                </AnimatePresence>
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
                  className={`flex items-center gap-3 ${bg} ${text} px-5
                    ${i % 2 === 0 ? "border-r border-white/10" : ""}
                    ${i < 2 ? "border-b border-white/10" : ""}
                    transition-opacity active:opacity-70
                    ${!active ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recent Transactions ── */}
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
                recentTx.map((tx) => {
                  const meta = getTxMeta(tx, myPhone);
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between px-4 py-3.5
                        border-l-4 transition-colors duration-100
                        ${meta.minus ? "border-l-orange/0 hover:border-l-orange hover:bg-orange/5" : "border-l-teal/0 hover:border-l-teal hover:bg-teal/5"}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <Badge variant={STATUS_VARIANT[tx.status]}>
                            {tx.status.charAt(0).toUpperCase() +
                              tx.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-navy-muted mt-0.5 truncate">
                          {meta.direction === "to" ? "To" : "From"}:{" "}
                          {meta.counterparty}
                        </p>
                        {tx.note && (
                          <p className="text-xs text-navy-muted italic">
                            {tx.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-6">
                        <p
                          className={`text-sm font-bold tabular-nums ${meta.color}`}
                        >
                          {meta.minus ? "−" : "+"}
                          {formatAmount(tx.amount)}
                        </p>
                        <p className="text-xs text-navy-muted">
                          {formatRelativeTime(tx.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
