"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Icon } from "./Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

// Delay (ms) between each menu item appearing.
const STAGGER = 45;

export function Header({ lang, nav, showRating }: { lang: Locale; nav: Dictionary["nav"]; showRating: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const links = [
    { href: `/${lang}/tariffs`, label: nav.tariffs },
    ...(showRating ? [{ href: `/${lang}/rating`, label: nav.rating }] : []),
  ];
  const isActive = (href: string) => pathname === href;

  // Shared classes for items that fade/slide in one after another.
  const item = `transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
  }`;
  const delay = (i: number) => ({ transitionDelay: open ? `${120 + i * STAGGER}ms` : "0ms" });

  return (
    <>
    {/* Backdrop lives outside <header>: its backdrop-filter would otherwise contain this fixed layer */}
    <div
      aria-hidden="true"
      onClick={() => setOpen(false)}
      className={`fixed inset-x-0 z-30 bottom-0 top-16 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    />

    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-surface/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-site items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo lang={lang} />

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label={nav.menu}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                isActive(l.href) ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-3 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher lang={lang} label={nav.language} />
          <Link
            href={`/${lang}/register`}
            className="hidden h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-ink transition hover:bg-brand-hover active:bg-brand-press sm:flex"
          >
            {nav.register}
            <Icon name="arrowUpRight" className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.close : nav.menu}
            className={`relative flex size-10 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden ${
              open ? "border-ink bg-ink text-brand" : "border-line bg-surface text-ink"
            }`}
          >
            {/* Three bars that morph into an X */}
            <span aria-hidden="true" className="relative block h-3.5 w-[18px]">
              <span
                className={`absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-out ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
                  open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-out ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Panel stays mounted so it can animate out; `inert` hides it from focus and screen readers when closed */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`absolute inset-x-0 top-full max-h-[calc(100dvh-64px)] origin-top overflow-y-auto rounded-b-[28px] border-b border-line bg-surface px-4 pb-8 pt-2 shadow-2xl shadow-ink/10 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "translate-y-0 scale-y-100 opacity-100" : "pointer-events-none -translate-y-4 scale-y-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col" aria-label={nav.menu}>
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(l.href) ? "page" : undefined}
              style={delay(i)}
              className={`group flex items-center justify-between border-b border-line-soft py-4 text-lg font-semibold ${item}`}
            >
              <span className="flex items-center gap-3">
                <span className="text-xs font-medium tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </span>
              <span
                className={`flex size-8 items-center justify-center rounded-full transition group-hover:bg-brand group-hover:text-ink group-active:scale-90 ${
                  isActive(l.href) ? "bg-brand text-ink" : "bg-surface-2 text-faint"
                }`}
              >
                <Icon name="arrowRight" className="size-4" />
              </span>
            </Link>
          ))}
        </nav>
        <Link
          href={`/${lang}/register`}
          onClick={() => setOpen(false)}
          style={delay(links.length)}
          className={`mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-semibold active:scale-[0.98] ${item}`}
        >
          {nav.register}
          <Icon name="arrowUpRight" className="size-5" />
        </Link>
        <div style={delay(links.length + 1)} className={`mt-3 grid grid-cols-2 gap-3 ${item}`}>
          <a href={site.phone.href} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-2 text-sm font-semibold active:scale-[0.98]">
            <Icon name="phone" className="size-4" /> {site.phone.display}
          </a>
          <a href={site.whatsapp.href} target="_blank" rel="noopener" className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-2 text-sm font-semibold active:scale-[0.98]">
            <Icon name="message" className="size-4" /> WhatsApp
          </a>
        </div>
      </div>
    </header>
    </>
  );
}
