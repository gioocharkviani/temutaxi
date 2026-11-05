import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Icon, type IconName } from "../Icon";
import { SectionHead } from "./SectionHead";

type Role = Dictionary["roles"]["drivers"];

export function Roles({ t, lang }: { t: Dictionary["roles"]; lang: Locale }) {
  return (
    <section id="roles" aria-labelledby="roles-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHead id="roles-title" label={t.label} title={t.title} />
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <RoleCard role={t.drivers} icon="car" variant="brand" href={`/${lang}/register`} />
        {/* The registration form is taxi-only for now, so couriers reach a manager instead. */}
        <RoleCard role={t.couriers} icon="package" variant="dark" href={site.whatsapp.href} external />
      </div>
    </section>
  );
}

function RoleCard({
  role,
  icon,
  variant,
  href,
  external = false,
}: {
  role: Role;
  icon: IconName;
  variant: "brand" | "dark";
  href: string;
  external?: boolean;
}) {
  const brand = variant === "brand";
  const LinkTag = external ? "a" : Link;
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[32px] p-7 sm:p-10 ${
        brand ? "bg-brand text-ink" : "bg-dark text-surface"
      }`}
    >
      <Icon
        name={icon}
        strokeWidth={1.25}
        className={`pointer-events-none absolute -right-8 -top-8 size-56 transition-transform duration-500 group-hover:-rotate-6 ${
          brand ? "text-ink/10" : "text-surface/5"
        }`}
      />
      <span
        className={`flex size-14 items-center justify-center rounded-2xl ${
          brand ? "bg-ink text-brand" : "bg-brand text-ink"
        }`}
      >
        <Icon name={icon} className="size-7" />
      </span>
      <p className={`mt-8 text-sm font-semibold uppercase tracking-[0.14em] ${brand ? "text-ink-2" : "text-brand"}`}>
        {role.tag}
      </p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">{role.title}</h3>
      <p className={`mt-4 max-w-lg text-base leading-relaxed ${brand ? "text-ink-2" : "text-on-dark-muted"}`}>
        {role.body}
      </p>
      <ul className="mt-6 space-y-3">
        {role.points.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                brand ? "bg-ink/10" : "bg-surface/10 text-brand"
              }`}
            >
              <Icon name="check" className="size-3.5" strokeWidth={3} />
            </span>
            <span className="font-medium">{p}</span>
          </li>
        ))}
      </ul>
      <LinkTag
        href={href}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
        className={`mt-10 inline-flex h-14 items-center justify-between gap-3 self-stretch rounded-2xl px-6 font-semibold transition sm:self-start sm:pr-4 ${
          brand ? "bg-ink text-surface hover:bg-dark-2" : "bg-brand text-ink hover:bg-brand-hover"
        }`}
      >
        {role.cta}
        <span
          className={`flex size-9 items-center justify-center rounded-xl transition group-hover:translate-x-0.5 ${
            brand ? "bg-brand text-ink" : "bg-ink text-brand"
          }`}
        >
          <Icon name="arrowRight" className="size-4" />
        </span>
      </LinkTag>
    </article>
  );
}
