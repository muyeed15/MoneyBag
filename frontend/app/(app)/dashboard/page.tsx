import { getWallet, getTransactions, getNotifications } from "@/utils/api";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [wallet, transactions, notifications] = await Promise.all([
    getWallet(),
    getTransactions(),
    getNotifications(),
  ]);

  return (
    <DashboardClient
      initialWallet={wallet}
      initialTransactions={transactions}
      initialNotifications={notifications}
    />
  );
}
