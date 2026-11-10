import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { AppLinks } from "./AppLinks";
import { Logo } from "./Logo";

export function Footer({ lang, t, nav, apps }: { lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"]; apps: Dictionary["apps"] }) {
  const links = [
    { href: `/${lang}#roles`, label: nav.roles },
    { href: `/${lang}/tariffs`, label: nav.tariffs },
    { href: `/${lang}#benefits`, label: nav.benefits },
    { href: `/${lang}#steps`, label: nav.steps },
    { href: `/${lang}#faq`, label: nav.faq },
  ];

  return (
    <footer className="bg-dark text-surface">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo lang={lang} inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-dark-muted">{t.tagline}</p>
          <address className="mt-6 text-sm not-italic leading-relaxed text-faint">
            <strong className="text-on-dark-muted">{site.company.name}</strong>
            <br />
            ID: {site.company.id}
            <br />
            {site.company.address}
          </address>
          <Link href={`/${lang}/privacy`} className="mt-4 inline-block text-sm text-on-dark-muted underline underline-offset-4 transition hover:text-brand">
            {t.policy}
          </Link>
        </div>

        <nav aria-label={t.navTitle}>
          <p className="text-sm font-semibold">{t.navTitle}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-on-dark-muted">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-brand">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold">{t.contactTitle}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-on-dark-muted">
            <li><a href={site.phone.href} className="transition hover:text-brand">+995 {site.phone.display}</a></li>
            <li><a href={site.whatsapp.href} target="_blank" rel="noopener" className="transition hover:text-brand">WhatsApp: {site.whatsapp.display}</a></li>
            <li><a href={`mailto:${site.email}`} className="break-all transition hover:text-brand">{site.email}</a></li>
          </ul>
          <p className="mt-8 text-sm font-semibold">{apps.title}</p>
          <AppLinks t={apps} tone="dark" className="mt-4" />
        </div>
      </div>

      <div className="border-t border-dark-2">
        <div className="mx-auto flex max-w-site flex-col gap-3 px-4 py-6 text-xs text-faint sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>{t.disclaimer}</p>
          <div className="flex shrink-0 flex-col gap-1 md:items-end">
            <p>© {site.copyrightYear} {site.company.name}. {t.rights}</p>
            <p>
              {t.madeBy}{" "}
              <a href="https://bytz.ge" target="_blank" rel="noopener" className="font-semibold text-on-dark-muted transition hover:text-brand">
                bytz.ge
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
