import { getMe, getNotifications } from "@/utils/api";
import { AppShell } from "@/components/layout/AppShell";

// All pages under (app) read cookies for auth — must not be statically prerendered.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, notifications] = await Promise.all([
    getMe(),
    getNotifications(),
  ]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  return (
    <AppShell user={user} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
