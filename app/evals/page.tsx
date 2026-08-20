import evalMetrics from "@/data/eval-metrics.json";
import { modelMeta } from "@/lib/classifier";
import StatTile from "@/components/charts/StatTile";
import ConfusionMatrix from "@/components/charts/ConfusionMatrix";
import Reveal from "@/components/Reveal";

export default function EvalsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-currency">
        Approval-model evals
      </Reveal>
      <Reveal as="h1" delay={0.05} className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        The decision, held to a number.
      </Reveal>
      <Reveal as="p" delay={0.1} className="mt-4 max-w-2xl text-ink-soft">
        A logistic regression trained on {modelMeta.trainedOn.toLocaleString()}{" "}
        synthetic invoice-vs-PO comparisons ({modelMeta.featureNames.join(", ")}),
        evaluated on a held-out split it never trained on.
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Reveal variant="scale-in" delay={0}>
          <StatTile label="Accuracy (held-out)" value={`${Math.round(evalMetrics.accuracy * 100)}%`} />
        </Reveal>
        <Reveal variant="scale-in" delay={0.06}>
          <StatTile label="Train / test split" value={`${evalMetrics.trainSize} / ${evalMetrics.testSize}`} />
        </Reveal>
        <Reveal variant="scale-in" delay={0.12}>
          <StatTile label="Decisions" value={evalMetrics.classes.map((c: string) => c.replace(/_/g, " ")).join(" / ")} />
        </Reveal>
      </div>

      <Reveal className="mt-10 overflow-hidden rounded-sm border border-ink/12 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ledger-dim/70 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3">Decision</th>
              <th className="px-5 py-3">Precision</th>
              <th className="px-5 py-3">Recall</th>
              <th className="px-5 py-3">F1</th>
              <th className="px-5 py-3">Support</th>
            </tr>
          </thead>
          <tbody>
            {evalMetrics.perClass.map((row) => (
              <tr key={row.label} className="border-t border-ink/8 transition-colors hover:bg-ledger-dim/40">
                <td className="px-5 py-3 font-medium text-ink">{row.label.replace(/_/g, " ")}</td>
                <td className="px-5 py-3 font-mono tabular-nums">{row.precision.toFixed(2)}</td>
                <td className="px-5 py-3 font-mono tabular-nums">{row.recall.toFixed(2)}</td>
                <td className="px-5 py-3 font-mono tabular-nums">{row.f1.toFixed(2)}</td>
                <td className="px-5 py-3 font-mono tabular-nums">{row.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal variant="scale-in" className="mt-10 rounded-sm border border-ink/12 bg-white p-7">
        <h2 className="font-display text-2xl font-semibold text-ink">Confusion matrix</h2>
        <p className="mt-1 text-sm text-ink-soft">
          &ldquo;Needs review&rdquo; is the hardest class to call — exactly
          the ambiguous middle ground a real approval workflow should be
          cautious about, not confident on.
        </p>
        <div className="mt-6">
          <ConfusionMatrix classes={evalMetrics.classes} matrix={evalMetrics.confusionMatrix} />
        </div>
      </Reveal>
    </main>
  );
}
