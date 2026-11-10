import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { siteMetadata } from "@/lib/seo";
import { fontVariables } from "../fonts";
import "../globals.css";
import { Suspense } from "react";
import { SitePromotions } from "@/components/promo/SitePromotions";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata();
}

export const viewport: Viewport = {
  themeColor: "#fce000",
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">
        {/* The top bar and the pop-up, read from the database for each visit. */}
        <Suspense fallback={null}>
          <SitePromotions lang={lang} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
