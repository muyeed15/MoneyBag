import { getWallet, getTransactions, getNotifications } from "@/utils/api";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [wallet, txData, notifData] = await Promise.all([
    getWallet(),
    getTransactions(1),
    getNotifications(1),
  ]);

  return (
    <DashboardClient
      initialWallet={wallet}
      initialTransactions={txData.results}
      initialNotifications={notifData.results}
    />
  );
}
