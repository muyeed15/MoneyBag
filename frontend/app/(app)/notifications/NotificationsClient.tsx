"use client";

import { useTransition } from "react";
import useSWR from "swr";
import { formatDate } from "@/utils/helpers";
import { markAllReadAction, markNotificationReadAction } from "@/app/actions";
import type { Notification } from "@/utils/api";

export function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const { data: notifications = initialNotifications, mutate } = useSWR<
    Notification[]
  >("/api/notifications", { fallbackData: initialNotifications });
  const [isPending, startTransition] = useTransition();

  const unread = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    mutate(
      notifications.map((n) => ({ ...n, is_read: true })),
      false,
    );
    startTransition(async () => {
      await markAllReadAction();
      mutate();
    });
  };

  const markRead = (id: number) => {
    mutate(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      false,
    );
    startTransition(async () => {
      await markNotificationReadAction(id);
      mutate();
    });
  };

  return (
    <>
      <div className="bg-white border-b border-sage-mid px-6 h-16 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
            Activity
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-navy font-bold text-lg leading-tight">
              Notifications
            </h1>
            {unread > 0 && (
              <span className="bg-orange text-white text-xs font-bold px-2 py-0.5">
                {unread} new
              </span>
            )}
          </div>
        </div>
        {unread > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={markAllRead}
            className="text-xs font-semibold text-teal active:opacity-60 transition-opacity disabled:opacity-40"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        {notifications.length === 0 ? (
          <div className="bg-white border border-sage-mid px-6 py-12 text-center">
            <p className="text-navy font-semibold">No notifications</p>
            <p className="text-sm text-navy-muted mt-1">
              You're all caught up.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-sage-mid divide-y divide-sage-mid">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                disabled={n.is_read}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`w-full px-5 py-4 flex gap-4 text-left transition-colors duration-100
                  ${!n.is_read ? "border-l-4 border-orange bg-sage/30 hover:bg-sage/50 cursor-pointer" : "border-l-4 border-transparent"}
                `}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${!n.is_read ? "font-semibold text-navy" : "text-navy"}`}
                  >
                    {n.message}
                  </p>
                  <p className="text-xs text-navy-muted mt-1">
                    {formatDate(n.created_at)}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="h-2 w-2 rounded-full bg-orange mt-1.5 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
