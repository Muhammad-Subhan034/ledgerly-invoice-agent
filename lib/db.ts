import { neon } from "@neondatabase/serverless";
import type { ExtractedInvoice } from "./invoice-extract";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS processed_invoices (
          id TEXT PRIMARY KEY,
          vendor TEXT NOT NULL,
          matched_po TEXT,
          total NUMERIC NOT NULL,
          decision TEXT NOT NULL,
          extraction_confidence NUMERIC NOT NULL,
          extraction_method TEXT NOT NULL,
          math_consistent BOOLEAN NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS audit_events (
          id TEXT PRIMARY KEY,
          actor TEXT NOT NULL,
          action TEXT NOT NULL,
          detail TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  return schemaReady;
}

export type ProcessedInvoiceRecord = {
  id: string;
  vendor: string;
  matchedPo: string | null;
  total: number;
  decision: string;
  extractionConfidence: number;
  extractionMethod: ExtractedInvoice["extractionMethod"];
  mathConsistent: boolean;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actor: "system" | "human";
  action: string;
  detail: string;
  timestamp: string;
};

const memInvoices: ProcessedInvoiceRecord[] = [];
const memAudit: AuditEvent[] = [];

export async function insertProcessedInvoice(r: ProcessedInvoiceRecord): Promise<void> {
  await ensureSchema();
  if (!sql) return void memInvoices.unshift(r);
  await sql`
    INSERT INTO processed_invoices (id, vendor, matched_po, total, decision, extraction_confidence, extraction_method, math_consistent, created_at)
    VALUES (${r.id}, ${r.vendor}, ${r.matchedPo}, ${r.total}, ${r.decision}, ${r.extractionConfidence}, ${r.extractionMethod}, ${r.mathConsistent}, ${r.createdAt})
  `;
}

export async function listProcessedInvoices(): Promise<ProcessedInvoiceRecord[]> {
  await ensureSchema();
  if (!sql) return memInvoices;
  const rows = await sql`SELECT * FROM processed_invoices ORDER BY created_at DESC LIMIT 200`;
  return rows.map((r) => ({
    id: r.id as string,
    vendor: r.vendor as string,
    matchedPo: (r.matched_po as string) ?? null,
    total: Number(r.total),
    decision: r.decision as string,
    extractionConfidence: Number(r.extraction_confidence),
    extractionMethod: r.extraction_method as ExtractedInvoice["extractionMethod"],
    mathConsistent: r.math_consistent as boolean,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export async function insertAuditEvent(e: AuditEvent): Promise<void> {
  await ensureSchema();
  if (!sql) return void memAudit.unshift(e);
  await sql`
    INSERT INTO audit_events (id, actor, action, detail, timestamp)
    VALUES (${e.id}, ${e.actor}, ${e.action}, ${e.detail}, ${e.timestamp})
  `;
}

export async function listAuditEvents(): Promise<AuditEvent[]> {
  await ensureSchema();
  if (!sql) return memAudit;
  const rows = await sql`SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 200`;
  return rows.map((r) => ({
    id: r.id as string,
    actor: r.actor as AuditEvent["actor"],
    action: r.action as string,
    detail: r.detail as string,
    timestamp: new Date(r.timestamp as string).toISOString(),
  }));
}

export const usingLiveDb = Boolean(sql);
