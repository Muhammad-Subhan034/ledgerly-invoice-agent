export type PurchaseOrder = {
  id: string;
  poNumber: string;
  vendor: string;
  expectedTotal: number;
  expectedLineItems: number;
  category: string;
};

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "po-1", poNumber: "PO-1042", vendor: "CloudScale Hosting", expectedTotal: 1958.5, expectedLineItems: 3, category: "Infrastructure" },
  { id: "po-2", poNumber: "PO-1043", vendor: "Northwind Office Supply", expectedTotal: 412.0, expectedLineItems: 5, category: "Office" },
  { id: "po-3", poNumber: "PO-1044", vendor: "Apex Legal Services", expectedTotal: 6500.0, expectedLineItems: 1, category: "Professional Services" },
  { id: "po-4", poNumber: "PO-1045", vendor: "BrightPath Travel", expectedTotal: 2140.75, expectedLineItems: 4, category: "Travel" },
  { id: "po-5", poNumber: "PO-1046", vendor: "Vertex Software Licensing", expectedTotal: 8900.0, expectedLineItems: 2, category: "Software" },
  { id: "po-6", poNumber: "PO-1047", vendor: "Ferro Manufacturing Parts", expectedTotal: 3275.4, expectedLineItems: 6, category: "Hardware" },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Fuzzy-matches an extracted vendor name against the PO list — invoices
 *  rarely spell the vendor name identically to the PO record. */
export function matchPurchaseOrder(vendorName: string, poNumberHint?: string): PurchaseOrder | undefined {
  if (poNumberHint) {
    const byNumber = PURCHASE_ORDERS.find(
      (po) => normalize(po.poNumber) === normalize(poNumberHint)
    );
    if (byNumber) return byNumber;
  }
  const normalizedVendor = normalize(vendorName);
  return PURCHASE_ORDERS.find(
    (po) =>
      normalize(po.vendor).includes(normalizedVendor.slice(0, 6)) ||
      normalizedVendor.includes(normalize(po.vendor).slice(0, 6))
  );
}
