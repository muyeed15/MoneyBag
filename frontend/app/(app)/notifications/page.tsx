import { getNotifications } from "@/utils/api";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage() {
  const initialData = await getNotifications(1);
  return <NotificationsClient initialData={initialData} />;
}
