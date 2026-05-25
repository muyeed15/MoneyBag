import { getNotifications } from "@/utils/api";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return <NotificationsClient initialNotifications={notifications} />;
}
