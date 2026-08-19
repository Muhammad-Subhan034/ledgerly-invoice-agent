import weights from "./model/weights.json";

/** Pure-TS inference for the logistic regression trained in ml/train_classifier.py.
 *  Feature order: [amount_diff_pct, line_item_count_diff, vendor_matched,
 *  extraction_confidence, has_extra_line_item] */

type Weights = {
  featureNames: string[];
  classes: string[];
  featureMeans: number[];
  featureStds: number[];
  weights: number[][];
  bias: number[];
  trainedOn: number;
};

const W = weights as Weights;

export type ApprovalFeatures = {
  amountDiffPct: number;
  lineItemCountDiff: number;
  vendorMatched: number;
  extractionConfidence: number;
  hasExtraLineItem: number;
};

function toVector(f: ApprovalFeatures): number[] {
  return [
    f.amountDiffPct,
    f.lineItemCountDiff,
    f.vendorMatched,
    f.extractionConfidence,
    f.hasExtraLineItem,
  ];
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export type ApprovalResult = {
  decision: "reject" | "needs_review" | "auto_approve";
  probabilities: Record<string, number>;
};

export function classifyApproval(features: ApprovalFeatures): ApprovalResult {
  const x = toVector(features);
  const standardized = x.map((v, i) => (v - W.featureMeans[i]) / W.featureStds[i]);

  const logits = W.classes.map((_, classIdx) => {
    const row = W.weights[classIdx];
    const dot = row.reduce((sum, w, i) => sum + w * standardized[i], 0);
    return dot + W.bias[classIdx];
  });

  const probs = softmax(logits);
  const probabilities: Record<string, number> = {};
  W.classes.forEach((c, i) => (probabilities[c] = probs[i]));

  const topIdx = probs.indexOf(Math.max(...probs));
  return { decision: W.classes[topIdx] as ApprovalResult["decision"], probabilities };
}

export const modelMeta = {
  featureNames: W.featureNames,
  classes: W.classes,
  trainedOn: W.trainedOn,
};
