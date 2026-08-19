"""
Trains Ledgerly's approve/escalate classifier — the model that decides whether
an invoice-to-PO discrepancy is genuinely within tolerance (auto_approve),
needs a human look (needs_review), or looks like the wrong invoice entirely
(reject — typically a vendor mismatch).

Synthetic features mirror what real invoice-matching pipelines compute:
amount deviation from the PO, line-item count deviation, whether the vendor
matched at all, and the extraction step's own confidence. Labels come from a
weighted rule with noise (same honest-eval approach as every other project's
classifier here) — real training, real held-out accuracy, not hand-coded
thresholds pretending to be a model.
"""

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

RNG_SEED = 21
N_SAMPLES = 5000
FEATURE_NAMES = [
    "amount_diff_pct",
    "line_item_count_diff",
    "vendor_matched",
    "extraction_confidence",
    "has_extra_line_item",
]
CLASSES = ["reject", "needs_review", "auto_approve"]

OUT_DIR = Path(__file__).resolve().parent.parent / "lib" / "model"
EVAL_OUT = Path(__file__).resolve().parent.parent / "data" / "eval-metrics.json"


def generate_dataset(n: int, seed: int):
    rng = np.random.default_rng(seed)

    vendor_matched = rng.binomial(1, 0.85, n).astype(float)
    amount_diff_pct = np.clip(np.abs(rng.normal(0.04, 0.08, n)), 0, 1)
    line_item_count_diff = np.clip(rng.poisson(0.6, n), 0, 6).astype(float)
    extraction_confidence = np.clip(rng.beta(6, 1.5, n), 0, 1)
    has_extra_line_item = (line_item_count_diff > 0).astype(float) * rng.binomial(1, 0.7, n)

    noise = rng.normal(0, 0.5, n)
    # Lower score = more suspicious. Vendor mismatch dominates; amount deviation
    # and low extraction confidence push toward review; everything clean pushes
    # toward approve.
    score = (
        4.0 * vendor_matched
        - 6.0 * amount_diff_pct
        - 0.6 * line_item_count_diff
        + 2.5 * extraction_confidence
        - 1.2 * has_extra_line_item
        + noise
    )

    reject_cut, review_cut = np.quantile(score, [0.15, 0.55])
    labels = np.where(score <= reject_cut, "reject", np.where(score <= review_cut, "needs_review", "auto_approve"))
    # Vendor mismatch is close to an automatic reject regardless of score, matching
    # how real AP teams treat it — you don't auto-approve against the wrong vendor.
    labels = np.where(vendor_matched == 0, "reject", labels)

    X = np.stack(
        [amount_diff_pct, line_item_count_diff, vendor_matched, extraction_confidence, has_extra_line_item],
        axis=1,
    )
    return X, labels


def main():
    X, y = generate_dataset(N_SAMPLES, RNG_SEED)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RNG_SEED, stratify=y
    )

    scaler = StandardScaler().fit(X_train)
    X_train_s = scaler.transform(X_train)
    X_test_s = scaler.transform(X_test)

    clf = LogisticRegression(max_iter=2000, C=1.0)
    clf.fit(X_train_s, y_train)

    y_pred = clf.predict(X_test_s)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_test, y_pred, labels=CLASSES, zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred, labels=CLASSES)
    accuracy = float((y_pred == y_test).mean())

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    weights = {
        "featureNames": FEATURE_NAMES,
        "classes": list(clf.classes_),
        "featureMeans": scaler.mean_.tolist(),
        "featureStds": scaler.scale_.tolist(),
        "weights": clf.coef_.tolist(),
        "bias": clf.intercept_.tolist(),
        "trainedOn": N_SAMPLES,
        "seed": RNG_SEED,
    }
    (OUT_DIR / "weights.json").write_text(json.dumps(weights, indent=2))

    EVAL_OUT.parent.mkdir(parents=True, exist_ok=True)
    eval_report = {
        "accuracy": accuracy,
        "testSize": int(len(y_test)),
        "trainSize": int(len(y_train)),
        "classes": CLASSES,
        "perClass": [
            {
                "label": CLASSES[i],
                "precision": float(precision[i]),
                "recall": float(recall[i]),
                "f1": float(f1[i]),
                "support": int(support[i]),
            }
            for i in range(len(CLASSES))
        ],
        "confusionMatrix": cm.tolist(),
    }
    EVAL_OUT.write_text(json.dumps(eval_report, indent=2))

    print(f"accuracy={accuracy:.4f}")
    print(json.dumps(eval_report["perClass"], indent=2))


if __name__ == "__main__":
    main()
