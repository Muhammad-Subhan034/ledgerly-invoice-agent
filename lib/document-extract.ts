import { extractInvoiceFromText, extractInvoiceFromImage, type ExtractedInvoice } from "./invoice-extract";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

// pdfjs-dist (via pdf-parse) references DOMMatrix (a browser API) even for plain
// text extraction — present in local dev's Node process, absent on Vercel's
// serverless runtime. Polyfill it lazily before parsing a PDF.
async function ensurePdfPolyfills() {
  if (typeof (globalThis as Record<string, unknown>).DOMMatrix === "undefined") {
    const { default: DOMMatrix } = await import("dommatrix");
    (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrix;
  }
}

export async function extractInvoiceFromFile(file: File): Promise<ExtractedInvoice> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (name.endsWith(".pdf") || type === "application/pdf") {
    await ensurePdfPolyfills();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return extractInvoiceFromText(result.text, "pdf-text");
    } finally {
      await parser.destroy();
    }
  }

  if (name.endsWith(".docx") || type.includes("wordprocessingml")) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return extractInvoiceFromText(result.value, "docx-text");
  }

  if (IMAGE_TYPES.has(type) || /\.(png|jpe?g|webp)$/i.test(name)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    return extractInvoiceFromImage(base64, type || "image/png");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return extractInvoiceFromText(buffer.toString("utf-8"), "text");
}
