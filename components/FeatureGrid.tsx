import Link from "next/link";
import Reveal from "./Reveal";

const FEATURES = [
  {
    href: "/process",
    title: "Invoice processing",
    body: "Upload a real invoice — PDF, photo, or scan — and watch it get extracted, matched, and scored.",
  },
  {
    href: "/purchase-orders",
    title: "Purchase orders",
    body: "The actual POs every invoice is matched against — nothing scored against a number that isn't on file.",
  },
  {
    href: "/evals",
    title: "Approval-model evals",
    body: "Precision, recall, and a confusion matrix for the auto-approve/escalate decision, on a held-out set.",
  },
  {
    href: "/monitoring",
    title: "Drift monitoring",
    body: "Every processed invoice logged, with extraction confidence tracked over time as formats vary.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal as="p" className="font-mono text-[11px] uppercase tracking-widest text-currency">
        What's actually running
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.href} delay={i * 0.05}>
            <Link
              href={feature.href}
              className="group block h-full rounded-sm border border-ink/12 bg-white p-7 transition-colors hover:border-ink/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-ink">{feature.title}</h3>
                <span className="font-mono text-ink-soft transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
