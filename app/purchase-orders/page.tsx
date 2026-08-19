import { PURCHASE_ORDERS } from "@/lib/purchase-orders";

export default function PurchaseOrdersPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-currency">Purchase Orders</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        What's actually on file.
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Every invoice on <code className="rounded bg-ledger-dim px-1.5 py-0.5 font-mono text-[13px]">/process</code>{" "}
        is matched against one of these — nothing gets scored against a number
        that isn&rsquo;t recorded here.
      </p>

      <div className="mt-10 overflow-hidden rounded-sm border border-ink/12 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ledger-dim/70 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3">PO Number</th>
              <th className="px-5 py-3">Vendor</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Line Items</th>
              <th className="px-5 py-3">Expected Total</th>
            </tr>
          </thead>
          <tbody>
            {PURCHASE_ORDERS.map((po) => (
              <tr key={po.id} className="border-t border-ink/8">
                <td className="px-5 py-3 font-mono text-ink">{po.poNumber}</td>
                <td className="px-5 py-3 font-medium text-ink">{po.vendor}</td>
                <td className="px-5 py-3 text-ink-soft">{po.category}</td>
                <td className="px-5 py-3 font-mono tabular-nums text-ink-soft">{po.expectedLineItems}</td>
                <td className="px-5 py-3 font-mono tabular-nums text-currency">
                  ${po.expectedTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
