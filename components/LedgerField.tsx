"use client";

import { useEffect, useRef } from "react";

type Tick = { col: number; y: number; r: number; speed: number; gold: boolean };
type Pulse = { colA: number; colB: number; y: number; matched: boolean; fade: number };

// Hardcoded to match app/globals.css tokens — canvas can't read CSS custom
// properties directly, so these are kept in sync with :root by hand.
const COLUMN_LINE = "201, 214, 189"; // --column-line
const INK_SOFT = "82, 96, 74"; // --ink-soft
const CURRENCY = "166, 124, 30"; // --currency
const APPROVED = "47, 125, 79"; // --approved

const SPAWN_EVERY_FRAMES = 130;
const MAX_PULSES = 3;

/** The hero's background — a quiet ledger sheet rather than a generic
 *  gradient. Faint ruled columns run the width of the hero (echoing the
 *  page's own horizontal ledger rules), amounts drift up each column like a
 *  scrolling tape, and every few seconds an invoice figure (gold) and a PO
 *  figure (green) travel down two columns together and "reconcile" at a
 *  dashed audit line — the same match-and-approve idea as StampReveal,
 *  playing out ambiently behind the copy. */
export default function LedgerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let columns: number[] = [];
    let ticks: Tick[] = [];
    let pulses: Pulse[] = [];
    let auditY = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const colCount = Math.max(4, Math.min(7, Math.round(width / 170)));
      columns = Array.from({ length: colCount }, (_, i) => ((i + 0.5) / colCount) * width);
      auditY = height * 0.6;

      const count = Math.max(14, Math.min(30, Math.round((width * height) / 24000)));
      ticks = Array.from({ length: count }, () => ({
        col: Math.floor(Math.random() * columns.length),
        y: Math.random() * height,
        r: Math.random() * 1.3 + 1,
        speed: Math.random() * 0.13 + 0.05,
        gold: Math.random() > 0.8,
      }));
    }

    function drawColumns() {
      ctx!.strokeStyle = `rgba(${COLUMN_LINE}, 0.4)`;
      ctx!.lineWidth = 1;
      for (const x of columns) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // Static frame only — the ruled columns read as decoration, no motion.
      ctx.clearRect(0, 0, width, height);
      drawColumns();
      return () => window.removeEventListener("resize", resize);
    }

    function spawnPulse() {
      if (columns.length < 2) return;
      const colA = Math.floor(Math.random() * columns.length);
      let colB = Math.floor(Math.random() * columns.length);
      if (colB === colA) colB = (colB + 1) % columns.length;
      pulses.push({ colA, colB, y: -20, matched: false, fade: 1 });
    }

    let raf = 0;
    let frame = 0;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      drawColumns();

      // Dashed audit line — the y where invoice and PO figures reconcile.
      ctx!.strokeStyle = `rgba(${CURRENCY}, 0.22)`;
      ctx!.setLineDash([4, 5]);
      ctx!.beginPath();
      ctx!.moveTo(0, auditY);
      ctx!.lineTo(width, auditY);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Ambient ticks drifting up each column like a scrolling ledger tape.
      for (const t of ticks) {
        t.y -= t.speed;
        if (t.y < -10) t.y = height + 10;
        const x = columns[t.col];
        ctx!.beginPath();
        ctx!.fillStyle = t.gold ? `rgba(${CURRENCY}, 0.55)` : `rgba(${INK_SOFT}, 0.35)`;
        ctx!.arc(x, t.y, t.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Reconciliation pulses: an invoice figure and a PO figure travel down
      // two columns together, then flash a matched connector at the audit line.
      pulses = pulses.filter((p) => p.fade > 0.02);
      for (const p of pulses) {
        if (!p.matched) {
          p.y += 0.7;
          if (p.y >= auditY) p.matched = true;
        } else {
          p.fade -= 0.025;
        }

        const xA = columns[p.colA];
        const xB = columns[p.colB];
        const y = Math.min(p.y, auditY);
        const alpha = p.matched ? p.fade : 1;

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${CURRENCY}, ${alpha * 0.9})`;
        ctx!.arc(xA, y, 2.6, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${APPROVED}, ${alpha * 0.9})`;
        ctx!.arc(xB, y, 2.6, 0, Math.PI * 2);
        ctx!.fill();

        if (p.matched) {
          ctx!.strokeStyle = `rgba(${APPROVED}, ${alpha * 0.75})`;
          ctx!.lineWidth = 1.4;
          ctx!.beginPath();
          ctx!.moveTo(xA, auditY);
          ctx!.lineTo(xB, auditY);
          ctx!.stroke();
        }
      }

      frame++;
      if (frame % SPAWN_EVERY_FRAMES === 0 && pulses.length < MAX_PULSES) spawnPulse();

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
