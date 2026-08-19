import { listProcessedInvoices, usingLiveDb } from "@/lib/db";
import StatTile from "@/components/charts/StatTile";

export const dynamic = "force-dynamic";

const DECISION_TONE: Record<string, string> = {
  auto_approve: "text-approved",
  needs_review: "text-currency",
  reject: "text-hold",
};

export default async function MonitoringPage() {
  const invoices = await listProcessedInvoices();

  const avgConfidence = invoices.length
    ? invoices.reduce((s, i) => s + i.extractionConfidence, 0) / invoices.length
    : 0;
  const autoApproveRate = invoices.length
    ? invoices.filter((i) => i.decision === "auto_approve").length / invoices.length
    : 0;
  const inconsistentCount = invoices.filter((i) => !i.mathConsistent).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-currency">Monitoring</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Drift, watched — not assumed.
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        {usingLiveDb
          ? "Reading from the live Postgres processing log."
          : "No DATABASE_URL configured — reading from this server's in-memory log, which resets on redeploy."}{" "}
        Process an invoice on{" "}
        <a href="/process" className="underline">
          /process
        </a>{" "}
        to see entries appear here.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        <StatTile label="Invoices processed" value={String(invoices.length)} />
        <StatTile
          label="Avg. extraction confidence"
          value={`${Math.round(avgConfidence * 100)}%`}
          tone={avgConfidence < 0.6 ? "critical" : "good"}
        />
        <StatTile label="Auto-approve rate" value={`${Math.round(autoApproveRate * 100)}%`} />
        <StatTile
          label="Math-inconsistent extractions"
          value={String(inconsistentCount)}
          tone={inconsistentCount > 0 ? "critical" : "good"}
          hint="line items didn't sum to stated total"
        />
      </div>

      <div className="mt-10 overflow-hidden rounded-sm border border-ink/12 bg-white">
        {invoices.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-soft">No invoices processed yet.</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-ledger-dim/70 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">PO</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Decision</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-ink/8">
                  <td className="px-5 py-3 font-medium text-ink">{inv.vendor}</td>
                  <td className="px-5 py-3 text-ink-soft">{inv.matchedPo ?? "—"}</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-currency">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className={`px-5 py-3 font-mono text-[11px] uppercase ${DECISION_TONE[inv.decision]}`}>
                    {inv.decision.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3 font-mono tabular-nums">
                    {Math.round(inv.extractionConfidence * 100)}%
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{inv.extractionMethod}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {new Date(inv.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
