export default function StatTile({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "critical";
  hint?: string;
}) {
  const toneClass =
    tone === "good" ? "text-approved" : tone === "critical" ? "text-hold" : "text-ink";
  const glow =
    tone === "good" ? "var(--approved)" : tone === "critical" ? "var(--hold)" : "var(--currency)";

  return (
    <div
      style={{ ["--tile-glow" as string]: glow }}
      className="rounded-sm border border-ink/12 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--tile-glow)]/50 hover:shadow-[0_14px_34px_-20px_var(--tile-glow)]"
    >
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</p>
      <p className={`mt-2 font-body text-3xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
