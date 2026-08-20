import Reveal from "./Reveal";
import FeatureCard from "./FeatureCard";

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
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-currency">
        What's actually running
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.href} variant="scale-in" delay={i * 0.06}>
            <FeatureCard href={feature.href} title={feature.title} body={feature.body} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
