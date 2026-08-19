import { hfChat, hfVisionChat } from "./hf";

export type LineItem = { description: string; quantity: number; unitPrice: number; amount: number };

export type ExtractedInvoice = {
  vendor: string;
  poNumberHint: string | null;
  lineItems: LineItem[];
  total: number;
  extractionConfidence: number;
  extractionMethod: "pdf-text" | "docx-text" | "text" | "vision";
  mathConsistent: boolean;
};

const EXTRACTION_INSTRUCTIONS = `Extract this invoice/receipt into JSON with this exact shape:
{"vendor": string, "poNumberHint": string|null, "lineItems": [{"description": string, "quantity": number, "unitPrice": number, "amount": number}], "total": number, "selfReportedConfidence": number between 0 and 1}
selfReportedConfidence should reflect how clearly you could read every field — lower it if anything was blurry, ambiguous, or you had to guess.
Output ONLY the JSON object, no markdown, no commentary.`;

function parseAndValidate(
  raw: string,
  method: ExtractedInvoice["extractionMethod"]
): ExtractedInvoice {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const lineItems: LineItem[] = Array.isArray(parsed.lineItems)
    ? parsed.lineItems.map((li: Record<string, unknown>) => ({
        description: String(li.description ?? "Item"),
        quantity: Number(li.quantity) || 1,
        unitPrice: Number(li.unitPrice) || 0,
        amount: Number(li.amount) || 0,
      }))
    : [];

  const total = Number(parsed.total) || lineItems.reduce((s, li) => s + li.amount, 0);
  const lineItemSum = lineItems.reduce((s, li) => s + li.amount, 0);
  const mathConsistent = total === 0 ? true : Math.abs(lineItemSum - total) / total < 0.02;

  const selfReported = Math.min(1, Math.max(0, Number(parsed.selfReportedConfidence) || 0.7));
  // Cross-check: math inconsistency is a real, independent signal the model's
  // own self-report can't see (it doesn't re-verify its own arithmetic against
  // itself) — penalize it rather than trusting the self-report alone.
  const extractionConfidence = mathConsistent ? selfReported : selfReported * 0.55;

  return {
    vendor: String(parsed.vendor ?? "Unknown vendor"),
    poNumberHint: parsed.poNumberHint ?? null,
    lineItems,
    total,
    extractionConfidence,
    extractionMethod: method,
    mathConsistent,
  };
}

export async function extractInvoiceFromText(
  text: string,
  method: "pdf-text" | "docx-text" | "text"
): Promise<ExtractedInvoice> {
  const raw = await hfChat(
    [
      { role: "system", content: "You are a precise invoice-data extraction system." },
      { role: "user", content: `${EXTRACTION_INSTRUCTIONS}\n\nDocument text:\n${text}` },
    ],
    { maxTokens: 600 }
  );
  if (!raw) throw new Error("Extraction model call failed — no response from the LLM.");
  return parseAndValidate(raw, method);
}

export async function extractInvoiceFromImage(
  base64Image: string,
  mimeType: string
): Promise<ExtractedInvoice> {
  const raw = await hfVisionChat(base64Image, mimeType, EXTRACTION_INSTRUCTIONS, { maxTokens: 700 });
  if (!raw) throw new Error("Vision extraction failed — no response from the vision model.");
  return parseAndValidate(raw, "vision");
}
