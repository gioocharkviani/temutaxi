"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/i18n/config";
import { Icon } from "./Icon";

function swapLocale(pathname: string, next: Locale) {
  const parts = pathname.split("/");
  parts[1] = next;
  return parts.join("/") || `/${next}`;
}

function remember(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink transition hover:border-ink-2"
      >
        <Icon name="globe" className="size-4" />
        {localeLabels[lang].short}
        <Icon name="chevronDown" className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-ink/10"
        >
          {locales.map((locale) => (
            <li key={locale} role="none">
              <Link
                role="menuitem"
                href={swapLocale(pathname, locale)}
                hrefLang={locale}
                aria-current={locale === lang ? "true" : undefined}
                onClick={() => {
                  remember(locale);
                  setOpen(false);
                }}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-surface-2 ${
                  locale === lang ? "font-semibold text-ink" : "text-ink-2"
                }`}
              >
                <span>{localeLabels[locale].name}</span>
                <span className="text-xs text-faint">{localeLabels[locale].short}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
