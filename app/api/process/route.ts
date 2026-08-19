import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { extractInvoiceFromFile } from "@/lib/document-extract";
import { extractInvoiceFromText } from "@/lib/invoice-extract";
import { matchPurchaseOrder } from "@/lib/purchase-orders";
import { classifyApproval } from "@/lib/classifier";
import { insertProcessedInvoice, insertAuditEvent } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const approvalThreshold = Number(req.nextUrl.searchParams.get("threshold") ?? "0.7");

  let extracted;
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      extracted = await extractInvoiceFromFile(file);
    } else {
      const body = await req.json().catch(() => null);
      const text = body?.text as string | undefined;
      if (!text || !text.trim()) {
        return NextResponse.json({ error: "text is required" }, { status: 400 });
      }
      extracted = await extractInvoiceFromText(text, "text");
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Extraction failed" },
      { status: 422 }
    );
  }

  const matchedPo = matchPurchaseOrder(extracted.vendor, extracted.poNumberHint ?? undefined);

  const amountDiffPct = matchedPo
    ? Math.abs(extracted.total - matchedPo.expectedTotal) / Math.max(matchedPo.expectedTotal, 1)
    : 1; // no PO on file at all reads as maximally suspicious
  const lineItemCountDiff = matchedPo
    ? Math.abs(extracted.lineItems.length - matchedPo.expectedLineItems)
    : extracted.lineItems.length;

  const features = {
    amountDiffPct: Math.min(1, amountDiffPct),
    lineItemCountDiff: Math.min(6, lineItemCountDiff),
    vendorMatched: matchedPo ? 1 : 0,
    extractionConfidence: extracted.extractionConfidence,
    hasExtraLineItem: lineItemCountDiff > 0 ? 1 : 0,
  };

  const approval = classifyApproval(features);
  // Configurable threshold: even if the model's top call is auto_approve, only
  // honor it if it clears the confidence bar a human set — otherwise fall back
  // to a human look rather than silently trusting a close call.
  let decision = approval.decision;
  if (decision === "auto_approve" && approval.probabilities.auto_approve < approvalThreshold) {
    decision = "needs_review";
  }

  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    vendor: extracted.vendor,
    matchedPo: matchedPo?.poNumber ?? null,
    total: extracted.total,
    decision,
    extractionConfidence: extracted.extractionConfidence,
    extractionMethod: extracted.extractionMethod,
    mathConsistent: extracted.mathConsistent,
    createdAt: now,
  };

  await insertProcessedInvoice(record);
  await insertAuditEvent({
    id: randomUUID(),
    actor: "system",
    action: decision,
    detail: `${extracted.vendor} — $${extracted.total.toFixed(2)}${matchedPo ? ` matched to ${matchedPo.poNumber}` : " (no PO match found)"}, confidence ${(extracted.extractionConfidence * 100).toFixed(0)}%`,
    timestamp: now,
  });

  return NextResponse.json({
    extracted,
    matchedPo: matchedPo ?? null,
    features,
    approval: { ...approval, decision },
  });
}
