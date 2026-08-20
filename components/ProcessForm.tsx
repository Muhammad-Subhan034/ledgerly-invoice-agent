"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type ProcessResult = {
  extracted: {
    vendor: string;
    poNumberHint: string | null;
    lineItems: { description: string; quantity: number; unitPrice: number; amount: number }[];
    total: number;
    extractionConfidence: number;
    extractionMethod: string;
    mathConsistent: boolean;
  };
  matchedPo: { poNumber: string; vendor: string; expectedTotal: number; category: string } | null;
  features: Record<string, number>;
  approval: { decision: string; probabilities: Record<string, number> };
};

const DECISION_TONE: Record<string, string> = {
  auto_approve: "border-approved/40 bg-approved-soft text-approved",
  needs_review: "border-currency/40 bg-currency-soft text-currency",
  reject: "border-hold/40 bg-hold-soft text-hold",
};

const SAMPLE_INVOICE_TEXT = `Invoice from CloudScale Hosting
PO Reference: PO-1042
Line items:
- Cloud hosting - Nov: qty 1, unit price $1240.00, amount $1240.00
- API usage overage: qty 1, unit price $318.50, amount $318.50
- Support plan: qty 1, unit price $400.00, amount $400.00
Total: $1958.50`;

export default function ProcessForm() {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState(SAMPLE_INVOICE_TEXT);
  const [threshold, setThreshold] = useState(0.7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [barsReady, setBarsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    setBarsReady(false);
    try {
      let res: Response;
      const url = `/api/process?threshold=${threshold}`;
      if (mode === "upload" && file) {
        const form = new FormData();
        form.append("file", file);
        res = await fetch(url, { method: "POST", body: form });
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");
      setResult(data);
      // Two rAFs so the browser paints the 0-width bars before the
      // transition to their real widths kicks in.
      requestAnimationFrame(() => requestAnimationFrame(() => setBarsReady(true)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!result || !resultRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.fromTo(
      resultRef.current,
      { opacity: 0, y: 18, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
    );
  }, [result]);

  const canSubmit = mode === "upload" ? Boolean(file) : Boolean(text.trim());

  return (
    <div>
      <div className="rounded-sm border border-ink/15 bg-white p-6">
        <div className="flex gap-2 border-b border-ink/10 pb-4">
          <button
            onClick={() => setMode("upload")}
            className={`rounded-sm px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide transition-colors ${
              mode === "upload" ? "bg-ink text-ledger" : "border border-ink/20 text-ink-soft"
            }`}
          >
            Upload file
          </button>
          <button
            onClick={() => setMode("paste")}
            className={`rounded-sm px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide transition-colors ${
              mode === "paste" ? "bg-ink text-ledger" : "border border-ink/20 text-ink-soft"
            }`}
          >
            Paste text
          </button>
        </div>

        {mode === "upload" ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-ink/25 px-6 py-10 text-center transition-colors hover:border-currency"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="font-medium text-ink">{file.name}</p>
            ) : (
              <>
                <p className="font-medium text-ink">Drop an invoice here, or click to browse</p>
                <p className="mt-1 text-xs text-ink-soft">PDF, DOCX, TXT, or a photo/scan (PNG, JPG)</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="mt-4 w-full rounded-sm border border-ink/20 bg-ledger/40 px-3 py-3 font-mono text-[13px] leading-relaxed outline-none focus:border-currency"
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            Auto-approve confidence threshold
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="accent-currency"
            />
            <span className="font-mono text-ink">{Math.round(threshold * 100)}%</span>
          </label>
        </div>

        <button
          onClick={run}
          disabled={busy || !canSubmit}
          data-cursor-hover
          className="group relative mt-4 overflow-hidden rounded-sm bg-ink px-5 py-2.5 font-mono text-[13px] uppercase tracking-wide text-ledger transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ledger/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative">{busy ? "Processing…" : "Process invoice"}</span>
        </button>
        {error && <p className="mt-3 text-sm text-hold">{error}</p>}
      </div>

      {result && (
        <div ref={resultRef} className="mt-8 space-y-4">
          <div className={`rounded-sm border p-5 ${DECISION_TONE[result.approval.decision]} bg-white`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-xl font-semibold text-ink">{result.extracted.vendor}</p>
              <span
                className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${DECISION_TONE[result.approval.decision]}`}
              >
                {result.approval.decision.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-currency">
              ${result.extracted.total.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {result.matchedPo
                ? `Matched to ${result.matchedPo.poNumber} (expected $${result.matchedPo.expectedTotal.toFixed(2)})`
                : "No matching purchase order found on file"}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Extraction confidence: {Math.round(result.extracted.extractionConfidence * 100)}% via{" "}
              {result.extracted.extractionMethod}
              {!result.extracted.mathConsistent && " — line items didn't sum to the stated total"}
            </p>

            <div className="mt-4 space-y-1">
              {result.extracted.lineItems.map((li, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{li.description}</span>
                  <span className="font-mono text-ink-soft">${li.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-3">
              {Object.entries(result.approval.probabilities)
                .sort((a, b) => b[1] - a[1])
                .map(([label, prob]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 font-mono text-[11px] uppercase text-ink-soft">
                      {label.replace(/_/g, " ")}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-ink/10">
                      <div
                        className="h-2 rounded-full bg-currency transition-[width] duration-700 ease-out"
                        style={{ width: `${barsReady ? Math.round(prob * 100) : 0}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-[11px] text-ink-soft">
                      {Math.round(prob * 100)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
