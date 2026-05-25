"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Home, Receipt, ArrowUpRight, Bell, User, LogOut } from "lucide-react";
import useSWR from "swr";
import { logoutAction } from "@/app/actions";
import { getInitials } from "@/utils/helpers";
import type {
  User as UserType,
  Notification,
  PaginatedResponse,
} from "@/types";

const NAV = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/transactions", icon: Receipt, label: "Transactions" },
  { href: "/send", icon: ArrowUpRight, label: "Send Money", accent: true },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function AppShell({
  user,
  unreadCount: initialUnread,
  children,
}: {
  user: UserType;
  unreadCount: number;
  children: ReactNode;
}): React.ReactElement {
  const path = usePathname();

  const { data: notifPage } = useSWR<PaginatedResponse<Notification>>(
    "/api/notifications?page=1",
  );

  const unreadCount = notifPage
    ? notifPage.results.filter((n) => !n.is_read).length
    : initialUnread;

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-navy fixed top-0 left-0 h-screen z-20">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-white font-bold text-base tracking-tight">
            MoneyBag
          </span>
        </div>

        <nav className="flex-1 py-3" aria-label="Main navigation">
          {NAV.map((item) => {
            const { href, label } = item;
            const Icon = item.icon;
            const accent = "accent" in item && item.accent;
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium border-l-2 transition-colors duration-100 ${
                  active
                    ? "border-orange bg-white/10 text-white"
                    : accent
                      ? "border-transparent text-orange hover:bg-white/5 hover:text-orange/90"
                      : "border-transparent text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {href === "/notifications" && unreadCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-orange text-white text-[8px] font-bold flex items-center justify-center"
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

        <div className="border-t border-white/10 px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 bg-teal flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="text-white text-xs font-bold">
                {getInitials(user.full_name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-white/50 truncate">{user.phone}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-white/50 active:opacity-60 transition-opacity"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────────────── */}
      <div className="flex-1 lg:ml-52 flex flex-col min-h-screen">
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-sage-mid"
        aria-label="Mobile navigation"
      >
        <div className="flex">
          {NAV.map((item) => {
            const { href, label } = item;
            const Icon = item.icon;
            const accent = "accent" in item && item.accent;
            const active = path === href;
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
                    className={`h-5 w-5 ${active ? "text-teal" : accent ? "text-orange" : "text-navy-muted"}`}
                    aria-hidden="true"
                  />
                  {href === "/notifications" && unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1.5 h-3 w-3 bg-orange text-white text-[7px] font-bold flex items-center justify-center"
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${active ? "text-teal" : accent ? "text-orange" : "text-navy-muted"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
