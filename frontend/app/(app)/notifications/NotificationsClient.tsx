"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Bell } from "lucide-react";
import { formatDate } from "@/utils/helpers";
import { markAllReadAction, markNotificationReadAction } from "@/app/actions";
import type { Notification, PaginatedResponse } from "@/types";
import { Pagination } from "@/components/ui/Pagination";
import { PageTransition } from "@/components/ui/PageTransition";

export function NotificationsClient({
  initialData,
}: {
  initialData: PaginatedResponse<Notification>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);

  const { data, mutate } = useSWR<PaginatedResponse<Notification>>(
    `/api/notifications?page=${page}`,
    { fallbackData: page === 1 ? initialData : undefined },
  );

  const notifications = data?.results ?? [];
  const totalPages = data?.total_pages ?? initialData.total_pages;
  const unread = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    const prev = data;
    if (data)
      mutate(
        { ...data, results: data.results.map((n) => ({ ...n, is_read: true })) },
        false,
      );
    startTransition(async () => {
      try {
        await markAllReadAction();
      } catch {
        if (prev) mutate(prev, false);
      }
      mutate();
    });
  };

  const markRead = (id: number) => {
    const prev = data;
    if (data)
      mutate(
        {
          ...data,
          results: data.results.map((n) =>
            n.id === id ? { ...n, is_read: true } : n,
          ),
        },
        false,
      );
    startTransition(async () => {
      try {
        await markNotificationReadAction(id);
      } catch {
        if (prev) mutate(prev, false);
      }
      mutate();
    });
  };

  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-white border-b border-sage-mid px-4 h-16 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="text-navy-muted active:opacity-60 transition-opacity"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
            Activity
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-navy font-bold text-lg leading-tight">
              Notifications
            </h1>
            {unread > 0 && (
              <span className="bg-orange text-white text-[10px] font-bold px-2 py-0.5 leading-none">
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
            className="text-xs font-semibold text-teal active:opacity-60 transition-opacity disabled:opacity-40 shrink-0"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        {notifications.length === 0 ? (
          <div className="bg-white border border-sage-mid px-6 py-16 text-center">
            <Bell
              className="h-10 w-10 text-navy-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-navy font-semibold">No notifications</p>
            <p className="text-sm text-navy-muted mt-1">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-sage-mid divide-y divide-sage-mid overflow-hidden">
            {notifications.map((n) =>
              n.is_read ? (
                <div
                  key={n.id}
                  className="px-5 py-4 flex gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-navy-muted mt-1">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="w-full px-5 py-4 flex gap-4 text-left border-l-4 border-orange bg-orange/5 hover:bg-orange/10 active:opacity-70 transition-colors duration-100 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-navy-muted mt-1">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                  <div className="h-2 w-2 bg-orange mt-1.5 shrink-0" />
                </button>
              ),
            )}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
