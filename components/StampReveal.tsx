"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const LINE_ITEMS = [
  { desc: "Cloud hosting — Nov", qty: "1", amount: "$1,240.00" },
  { desc: "API usage overage", qty: "1", amount: "$318.50" },
  { desc: "Support plan", qty: "1", amount: "$400.00" },
];

export default function StampReveal() {
  const scanRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(rowRefs.current, { opacity: 1, x: 0 });
      gsap.set(stampRef.current, { opacity: 1, scale: 1, rotate: -8 });
      return;
    }

    gsap.set(rowRefs.current, { opacity: 0, x: -10 });
    gsap.set(stampRef.current, { opacity: 0, scale: 1.6, rotate: -8 });

    const tl = gsap.timeline({ delay: 0.5 });
    tl.fromTo(
      scanRef.current,
      { yPercent: -20 },
      { yPercent: 320, duration: 1.3, ease: "power2.inOut" }
    )
      .to(
        rowRefs.current,
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.22, ease: "power2.out" },
        "-=1.1"
      )
      .to(scanRef.current, { opacity: 0, duration: 0.3 }, "-=0.3")
      .to(stampRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2.2)",
      });

    const failsafe = window.setTimeout(() => {
      if (tl.progress() < 1) tl.progress(1);
    }, 4000);

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-sm border border-ink/15 bg-white p-6 shadow-[6px_6px_0_var(--currency-soft)]">
      <div
        ref={scanRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-currency/20 to-transparent"
        aria-hidden="true"
      />
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        Invoice #INV-2291 — extracted live
      </p>
      <div className="mt-4 space-y-2">
        {LINE_ITEMS.map((item, i) => (
          <div
            key={item.desc}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className="flex items-center justify-between gap-2 border-b border-dashed border-ink/10 pb-1.5 text-sm"
          >
            <span className="text-ink">{item.desc}</span>
            <span className="font-mono text-ink-soft">{item.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-sm">
        <span className="text-ink-soft">Total</span>
        <span className="font-semibold text-currency">$1,958.50</span>
      </div>

      <div className="relative mt-5 flex h-16 items-center justify-center">
        <div
          ref={stampRef}
          className="pointer-events-none rounded-sm border-4 border-approved px-5 py-2 font-display text-xl font-bold uppercase tracking-widest text-approved"
        >
          Approved
        </div>
      </div>
    </div>
  );
}
