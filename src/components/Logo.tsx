import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { site } from "@/config/site";

// Brand mark: a "T" on the brand yellow, with a taxi-checker accent on the crossbar.
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#fce000" />
      <path d="M10 11.5h20a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-6.5V29a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 16.5 29V17.5H10A1.5 1.5 0 0 1 8.5 16v-3a1.5 1.5 0 0 1 1.5-1.5Z" fill="#21201f" />
      <rect x="11" y="13.5" width="2.5" height="2" fill="#fce000" />
      <rect x="16" y="13.5" width="2.5" height="2" fill="#fce000" />
      <rect x="21.5" y="13.5" width="2.5" height="2" fill="#fce000" />
      <rect x="26.5" y="13.5" width="2.5" height="2" fill="#fce000" />
    </svg>
  );
}

export function Logo({ lang, inverted = false }: { lang: Locale; inverted?: boolean }) {
  return (
    <Link href={`/${lang}`} className="flex shrink-0 items-center gap-2.5" aria-label={site.domain}>
      <LogoMark />
      <span className={`font-display text-lg font-bold tracking-tight ${inverted ? "text-surface" : "text-ink"}`}>
        temu<span className={inverted ? "text-brand" : ""}>taxi</span>
        <span className={inverted ? "text-on-dark-muted" : "text-faint"}>.ge</span>
      </span>
    </Link>
  );
}
