import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "ადმინ პანელი — TemuTaxi",
  robots: { index: false, follow: false },
};

// A separate root layout: the admin panel is Georgian-only and has no site header or footer.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ka" data-scroll-behavior="smooth" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
