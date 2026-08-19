import type { Metadata } from "next";
import { Roboto_Slab, IBM_Plex_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import GrainOverlay from "@/components/GrainOverlay";
import Nav from "@/components/Nav";

const slab = Roboto_Slab({
  variable: "--font-slab",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Ledgerly — invoice & expense processing agent",
  description:
    "Extracts line items from an invoice or receipt, matches it against a purchase order, and auto-approves or escalates by a real trained threshold — never pays something that doesn't reconcile.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${slab.variable} ${plexSans.variable} ${courier.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ledger text-ink font-body antialiased">
        <SmoothScrollProvider>
          <GrainOverlay />
          <Nav />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
