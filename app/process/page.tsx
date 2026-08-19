import ProcessForm from "@/components/ProcessForm";

export default function ProcessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-currency">Process</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Upload it. Watch it get checked.
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Real extraction, real PO matching, real trained model — adjust the
        auto-approve threshold and see the decision change live.
      </p>
      <div className="mt-10">
        <ProcessForm />
      </div>
    </main>
  );
}
