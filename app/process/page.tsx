import ProcessForm from "@/components/ProcessForm";
import Reveal from "@/components/Reveal";

export default function ProcessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-currency">
        Process
      </Reveal>
      <Reveal as="h1" delay={0.05} className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Upload it. Watch it get checked.
      </Reveal>
      <Reveal as="p" delay={0.1} className="mt-4 max-w-2xl text-ink-soft">
        Real extraction, real PO matching, real trained model — adjust the
        auto-approve threshold and see the decision change live.
      </Reveal>
      <Reveal variant="scale-in" delay={0.15} className="mt-10">
        <ProcessForm />
      </Reveal>
    </main>
  );
}
