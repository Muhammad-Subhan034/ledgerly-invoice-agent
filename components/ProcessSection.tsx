import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Extract",
    body: "A vision model reads the invoice image or PDF and structures it into vendor, line items, and totals.",
  },
  {
    n: "02",
    title: "Match to PO",
    body: "The extracted invoice is matched against the purchase order on file by vendor and amount.",
  },
  {
    n: "03",
    title: "Score the discrepancy",
    body: "A trained model — not a fixed rule — decides whether the mismatch is within real tolerance.",
  },
  {
    n: "04",
    title: "Approve or escalate",
    body: "Under threshold, it clears automatically. Above it, a human sees exactly why before anything pays.",
  },
];

export default function ProcessSection() {
  return (
    <section className="border-t border-ink/12 bg-ledger-dim/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal as="p" className="font-mono text-[11px] uppercase tracking-widest text-currency">
          How it processes
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-ink/12 bg-ink/10 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06} className="bg-ledger p-6">
              <span className="font-display text-3xl font-semibold text-ink/25">{step.n}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
