import { getMe, getNotifications } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";

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
