export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/12 bg-ink text-ledger">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg font-semibold">Ledgerly</p>
        <p className="max-w-md text-sm text-ledger/70">
          A demo-grade invoice processing agent built to show the real
          pattern: real vision-based extraction, a real trained
          approve/escalate model, and a threshold a human actually set.
        </p>
        <a
          href="https://github.com/Muhammad-Subhan034/ledgerly-invoice-agent"
          className="font-mono text-[12px] uppercase tracking-wide text-ledger/80 underline decoration-ledger/30 underline-offset-4 hover:text-ledger"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
