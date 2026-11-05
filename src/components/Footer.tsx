import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Logo } from "./Logo";

export function Footer({ lang, t, nav }: { lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  const links = [
    { href: `/${lang}#roles`, label: nav.roles },
    { href: `/${lang}/tariffs`, label: nav.tariffs },
    { href: `/${lang}#benefits`, label: nav.benefits },
    { href: `/${lang}#steps`, label: nav.steps },
    { href: `/${lang}#faq`, label: nav.faq },
  ];

  return (
    <footer className="bg-dark text-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
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
        </div>
      </div>

      <div className="border-t border-dark-2">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-faint sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>{t.disclaimer}</p>
          <p className="shrink-0">© {site.copyrightYear} {site.company.name}. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
