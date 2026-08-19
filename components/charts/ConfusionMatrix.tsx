"use client";

import { useState } from "react";

const SEQUENTIAL = [
  "#f2e6c8", "#ecd9a3", "#e5cc7f", "#dfbf5a", "#d8b236",
  "#c9a02b", "#a67c1e", "#8a6519", "#6e5014", "#523c0f",
];

function colorFor(value: number, max: number) {
  if (max === 0) return SEQUENTIAL[0];
  const t = Math.min(1, value / max);
  const idx = Math.round(t * (SEQUENTIAL.length - 1));
  return SEQUENTIAL[idx];
}

export default function ConfusionMatrix({
  classes,
  matrix,
}: {
  classes: string[];
  matrix: number[][];
}) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const max = Math.max(...matrix.flat());

  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="text-left"></th>
            <th
              colSpan={classes.length}
              className="pb-1 text-center font-mono text-[10px] uppercase tracking-wide text-ink-soft"
            >
              Predicted
            </th>
          </tr>
          <tr>
            <th className="pr-2 text-left font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              Actual
            </th>
            {classes.map((c) => (
              <th key={c} className="px-1 pb-1 text-center font-mono text-[11px] text-ink-soft">
                {c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={classes[i]}>
              <th className="pr-2 text-right font-mono text-[11px] font-normal text-ink-soft">
                {classes[i].replace(/_/g, " ")}
              </th>
              {row.map((value, j) => {
                const isHover = hover?.[0] === i && hover?.[1] === j;
                const bg = colorFor(value, max);
                const isDiagonal = i === j;
                return (
                  <td key={j}>
                    <div
                      onMouseEnter={() => setHover([i, j])}
                      onMouseLeave={() => setHover(null)}
                      className={`relative flex h-14 w-14 items-center justify-center rounded-[3px] font-mono text-sm transition-transform ${
                        isDiagonal ? "ring-1 ring-ink/25" : ""
                      } ${isHover ? "scale-[1.06]" : ""}`}
                      style={{ background: bg, color: value / max > 0.55 ? "#fff" : "#1c2318" }}
                      title={`Actual ${classes[i]}, predicted ${classes[j]}: ${value}`}
                    >
                      {value}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-ink-soft">
        Diagonal (ringed) cells are correct predictions on the held-out test set.
      </p>
    </div>
  );
}
