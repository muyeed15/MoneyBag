import { readFileSync } from "fs"
import { join } from "path"
import { getWallet, getTransactions } from "@/utils/api";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [wallet, txData] = await Promise.all([
    getWallet(),
    getTransactions(1),
  ]);

  const svgPath = join(process.cwd(), "assets", "yaqeen-balance-background.svg")
  let svgDataUri = ""
  try {
    const svg = readFileSync(svgPath, "utf-8")
    svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  } catch {
    // SVG not found, render without background
  }

  return (
    <DashboardClient
      initialWallet={wallet}
      initialTransactions={txData.results}
      svgDataUri={svgDataUri}
    />
  );
}
