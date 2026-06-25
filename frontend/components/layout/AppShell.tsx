"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect, useCallback, useRef } from "react";

import {
  Home, Receipt, ArrowUpRight, Bell, User,
  CreditCard, ShoppingCart, Landmark, Heart, LayoutGrid, QrCode,
} from "lucide-react";
import useSWR from "swr";
import { TOAST_DURATION_MS } from "@/utils/swr";
import { useSSE } from "@/hooks/useSSE";
import { ToastStack, type Toast } from "@/components/ui/Toast";
import type {
  User as UserType,
  Notification,
  PaginatedResponse,
} from "@/types";

const NAV = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/send", icon: ArrowUpRight, label: "Send" },
  { href: "/receive", icon: QrCode, label: "Receive" },
  { href: "/pay", icon: ShoppingCart, label: "Pay" },
  { href: "/savings", icon: Landmark, label: "Savings" },
  { href: "/charity", icon: Heart, label: "Charity" },
  { href: "/cards", icon: CreditCard, label: "Cards" },
  { href: "/transactions", icon: Receipt, label: "History" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

const MOBILE_NAV = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/receive", icon: QrCode, label: "Receive" },
  { href: "/send", icon: ArrowUpRight, label: "Send" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/more", icon: LayoutGrid, label: "More" },
] as const;

export function AppShell({
  user,
  unreadCount: initialUnread,
  initialLastId,
  children,
}: {
  user: UserType;
  unreadCount: number;
  initialLastId: number;
  children: ReactNode;
}): React.ReactElement {
  const path = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIds = useRef(new Set<number>());
  const notifInitialized = useRef(false);

  const { data: notifPage } = useSWR<PaginatedResponse<Notification>>(
    "/api/notifications?page=1",
  );

  const unreadCount = notifPage
    ? notifPage.results.filter((n) => !n.is_read).length
    : initialUnread;

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

  useSSE(initialLastId, (n) => {
    if (!seenIds.current.has(n.id)) {
      seenIds.current.add(n.id);
      pushToast(n.message);
    }
  });

  useEffect(() => {
    if (!notifPage) return;
    if (!notifInitialized.current) {
      notifPage.results.forEach((n) => seenIds.current.add(n.id));
      notifInitialized.current = true;
      return;
    }
    notifPage.results
      .filter((n) => !seenIds.current.has(n.id))
      .forEach((n) => {
        seenIds.current.add(n.id);
        pushToast(n.message);
      });
  }, [notifPage, pushToast]);

  return (
    <>
    <ToastStack toasts={toasts} onDismiss={dismissToast} />
    <div className="h-dvh flex flex-col overflow-hidden">
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-white border-r border-sage-mid fixed top-0 left-0 h-dvh z-20">
        <div className="px-5 h-16 flex items-center">
          <span className="text-navy font-bold text-base tracking-tight">
            Yaqeen
          </span>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto" aria-label="Main navigation">
          {NAV.map((item) => {
            const { href, label } = item;
            const Icon = item.icon;
            const active = path === href || path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium border-l-2 transition-colors duration-100 ${
                  active
                    ? "border-teal bg-teal/5 text-navy"
                    : "border-transparent text-navy-muted"
                }`}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {href === "/notifications" && unreadCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-teal text-white text-[8px] font-bold flex items-center justify-center rounded-full"
                      aria-label={`${unreadCount} unread notifications`}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {label}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* ── Content area ──────────────────────────────────────── */}
      <div className="flex-1 lg:ml-52 overflow-y-auto">
        <main>{children}</main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav
        className="lg:hidden shrink-0 z-20 bg-white border-t-2 border-sage-mid"
        aria-label="Mobile navigation"
      >
        <div className="flex">
          {MOBILE_NAV.map((item) => {
            const { href, label } = item;
            const Icon = item.icon;
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 ${
                  active
                    ? "border-t-2 border-teal"
                    : "border-t-2 border-transparent"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 ${active ? "text-navy" : "text-navy-muted"}`}
                    aria-hidden="true"
                  />
                  {href === "/notifications" && unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1.5 h-3 w-3 bg-teal text-white text-[7px] font-bold flex items-center justify-center rounded-full"
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${active ? "text-navy" : "text-navy-muted"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      </div>
    </>
  );
}
