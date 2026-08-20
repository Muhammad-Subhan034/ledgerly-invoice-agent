"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function FeatureCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = cardRef.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: py * -5,
      rotateY: px * 5,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 900,
    });
  }

  function onMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
  }

  return (
    <Link
      ref={cardRef}
      href={href}
      data-cursor-hover
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative block h-full overflow-hidden rounded-sm border border-ink/12 bg-white p-7 [transform-style:preserve-3d] transition-colors duration-300 hover:border-currency/50 hover:shadow-[0_16px_40px_-20px_var(--currency)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-currency/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <div className="relative flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
        <span className="font-mono text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-currency">
          →
        </span>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
    </Link>
  );
}
