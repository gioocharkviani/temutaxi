import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Icon, type IconName } from "../Icon";
import { FaqAccordion } from "./FaqAccordion";
import { SectionHead } from "./SectionHead";

export function FaqContact({ faq, contact }: { faq: Dictionary["faq"]; contact: Dictionary["contact"] }) {
  const channels: { icon: IconName; label: string; value: string; href: string; external?: boolean }[] = [
    { icon: "phone", label: contact.office, value: site.phone.display, href: site.phone.href },
    { icon: "message", label: contact.whatsapp, value: site.whatsapp.display, href: site.whatsapp.href, external: true },
    { icon: "mail", label: contact.email, value: site.email, href: `mailto:${site.email}` },
  ];

  return (
    <section className="mx-auto grid max-w-site gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-8 lg:py-28">
      <div id="faq" aria-labelledby="faq-title" role="region">
        <SectionHead id="faq-title" label={faq.label} title={faq.title} />
        <div className="mt-10">
          <FaqAccordion items={faq.items} />
        </div>
      </div>

      <aside id="contact" aria-labelledby="contact-title" className="lg:pt-2">
        <div className="rounded-[32px] bg-dark p-7 text-surface sm:p-9 lg:sticky lg:top-28">
          <SectionHead id="contact-title" label={contact.label} title={contact.title} dark />
          <p className="mt-4 text-on-dark-muted">{contact.note}</p>
          <ul className="mt-8 space-y-3">
            {channels.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
                  className="group flex items-center gap-4 rounded-2xl bg-dark-2 p-4 transition hover:bg-dark-3"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-ink">
                    <Icon name={c.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-on-dark-muted">{c.label}</span>
                    <strong className="block truncate text-lg font-semibold">{c.value}</strong>
                  </span>
                  <Icon name="arrowUpRight" className="size-5 shrink-0 text-faint transition group-hover:text-brand" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  );
}
