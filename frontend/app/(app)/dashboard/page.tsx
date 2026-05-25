import { getWallet, getTransactions } from "@/utils/api";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [wallet, txData] = await Promise.all([
    getWallet(),
    getTransactions(1),
  ]);

  return (
    <DashboardClient
      initialWallet={wallet}
      initialTransactions={txData.results}
    />
  );
}
