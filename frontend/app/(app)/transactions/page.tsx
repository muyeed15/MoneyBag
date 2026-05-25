import { getWallet, getTransactions } from "@/utils/api";
import {
  formatAmount,
  formatDate,
  getTxMeta,
  STATUS_VARIANT,
} from "@/utils/helpers";
import { PageTransition } from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { TransactionCard } from "@/components/ui/TransactionCard";

export default async function TransactionsPage(): Promise<React.ReactElement> {
  const [wallet, transactions] = await Promise.all([
    getWallet(),
    getTransactions(),
  ]);
  const myPhone = wallet.user_phone;

  return (
    <PageTransition>
      <div className="bg-white border-b border-sage-mid px-6 h-16 flex flex-col justify-center">
        <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
          History
        </p>
        <h1 className="text-navy font-bold text-lg leading-tight mt-0.5">
          Transactions
        </h1>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
        {transactions.length === 0 ? (
          <div className="bg-white border border-sage-mid px-6 py-16 text-center">
            <p className="text-navy font-semibold">No transactions yet</p>
            <p className="text-sm text-navy-muted mt-1">
              Your transaction history will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white border border-sage-mid overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-sage border-b border-sage-mid text-left">
                    {["Type", "Counterparty", "Status", "Date", "Amount"].map(
                      (h, i) => (
                        <th
                          key={h}
                          scope="col"
                          className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-navy-muted whitespace-nowrap ${i === 4 ? "text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-mid">
                  {transactions.map((tx) => {
                    const meta = getTxMeta(tx, myPhone);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-sage/40 transition-colors duration-100"
                      >
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy-muted max-w-[200px]">
                          <span className="text-xs text-navy-muted/70 uppercase tracking-wide">
                            {meta.direction === "to" ? "To" : "From"}
                          </span>
                          <span className="block font-medium text-navy truncate">
                            {meta.counterparty}
                          </span>
                          {tx.note && (
                            <span className="text-xs italic text-navy-muted/70">
                              {tx.note}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[tx.status]}>
                            {tx.status.charAt(0).toUpperCase() +
                              tx.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-navy-muted whitespace-nowrap text-xs">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span
                            className={`font-bold tabular-nums ${meta.color}`}
                          >
                            {meta.minus ? "−" : "+"}
                            {formatAmount(tx.amount)}
                          </span>
                          {parseFloat(tx.fee) > 0 && (
                            <span className="block text-xs text-navy-muted">
                              Fee {formatAmount(tx.fee)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list — reuses shared TransactionCard */}
            <div className="sm:hidden bg-white border border-sage-mid divide-y divide-sage-mid">
              {transactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} myPhone={myPhone} />
              ))}
            </div>

            <p className="text-xs text-navy-muted mt-3 text-right">
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""} total
            </p>
          </>
        )}
      </div>
    </PageTransition>
  );
}
