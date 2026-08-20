import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Extract",
    body: "A vision model reads the invoice image or PDF and structures it into vendor, line items, and totals.",
    color: "var(--ink-soft)",
  },
  {
    n: "02",
    title: "Match to PO",
    body: "The extracted invoice is matched against the purchase order on file by vendor and amount.",
    color: "var(--currency)",
  },
  {
    n: "03",
    title: "Score the discrepancy",
    body: "A trained model — not a fixed rule — decides whether the mismatch is within real tolerance.",
    color: "var(--currency)",
  },
  {
    n: "04",
    title: "Approve or escalate",
    body: "Under threshold, it clears automatically. Above it, a human sees exactly why before anything pays.",
    color: "var(--approved)",
  },
];

export default function ProcessSection() {
  return (
    <section className="border-t border-ink/12 bg-ledger-dim/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-currency">
          How it processes
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-ink/12 bg-ink/10 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} variant="scale-in" delay={i * 0.08}>
              <div
                style={{ ["--step-color" as string]: step.color }}
                className="group relative h-full overflow-hidden bg-ledger p-6 transition-colors duration-300 hover:bg-white"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[var(--step-color)] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
                <span className="font-display text-3xl font-semibold text-ink/25 transition-colors duration-300 group-hover:text-[var(--step-color)]">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
