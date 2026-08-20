import { listProcessedInvoices, usingLiveDb } from "@/lib/db";
import StatTile from "@/components/charts/StatTile";
import Reveal from "@/components/Reveal";

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
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-currency">
        Monitoring
      </Reveal>
      <Reveal as="h1" delay={0.05} className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Drift, watched — not assumed.
      </Reveal>
      <Reveal as="p" delay={0.1} className="mt-4 max-w-2xl text-ink-soft">
        {usingLiveDb
          ? "Reading from the live Postgres processing log."
          : "No DATABASE_URL configured — reading from this server's in-memory log, which resets on redeploy."}{" "}
        Process an invoice on{" "}
        <a href="/process" className="underline">
          /process
        </a>{" "}
        to see entries appear here.
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        <Reveal variant="scale-in" delay={0}>
          <StatTile label="Invoices processed" value={String(invoices.length)} />
        </Reveal>
        <Reveal variant="scale-in" delay={0.05}>
          <StatTile
            label="Avg. extraction confidence"
            value={`${Math.round(avgConfidence * 100)}%`}
            tone={avgConfidence < 0.6 ? "critical" : "good"}
          />
        </Reveal>
        <Reveal variant="scale-in" delay={0.1}>
          <StatTile label="Auto-approve rate" value={`${Math.round(autoApproveRate * 100)}%`} />
        </Reveal>
        <Reveal variant="scale-in" delay={0.15}>
          <StatTile
            label="Math-inconsistent extractions"
            value={String(inconsistentCount)}
            tone={inconsistentCount > 0 ? "critical" : "good"}
            hint="line items didn't sum to stated total"
          />
        </Reveal>
      </div>

      <Reveal className="mt-10 overflow-hidden rounded-sm border border-ink/12 bg-white">
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
                <tr key={inv.id} className="border-t border-ink/8 transition-colors hover:bg-ledger-dim/40">
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
      </Reveal>
    </main>
  );
}
