"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/process", label: "Process" },
  { href: "/purchase-orders", label: "Purchase Orders" },
  { href: "/evals", label: "Evals" },
  { href: "/monitoring", label: "Monitoring" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/12 bg-ledger/97">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          Ledgerly
        </Link>
        <nav className="flex items-center gap-1 font-mono text-[13px] uppercase tracking-wide">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-sm px-3 py-1.5 transition-colors ${
                  active ? "bg-ink text-ledger" : "text-ink-soft hover:bg-ledger-dim"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
