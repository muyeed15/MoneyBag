import { getNotifications } from "@/lib/api";
import { PageTransition } from "@/components/ui/PageTransition";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <PageTransition>
      <div className="bg-white border-b border-sage-mid px-6 h-16 flex flex-col justify-center">
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
              <div
                key={n.id}
                className={`px-5 py-4 flex gap-4 hover:bg-sage/30 transition-colors duration-100 ${!n.is_read ? "border-l-4 border-orange bg-sage/30" : "border-l-4 border-transparent"}`}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
