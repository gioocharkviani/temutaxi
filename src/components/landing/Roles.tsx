import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Icon } from "../Icon";
import { SectionHead } from "./SectionHead";

export function Roles({ t, lang }: { t: Dictionary["roles"]; lang: Locale }) {
  const { drivers } = t;
  return (
    <section id="roles" aria-labelledby="roles-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHead id="roles-title" label={t.label} title={t.title} />
      <article className="group relative mt-12 grid gap-10 overflow-hidden rounded-[32px] bg-brand p-7 text-ink sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-14">
        <Icon
          name="car"
          strokeWidth={1.25}
          className="pointer-events-none absolute -right-10 -top-10 size-72 text-ink/10 transition-transform duration-500 group-hover:-rotate-6"
        />
        <div className="relative">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-ink text-brand">
            <Icon name="car" className="size-7" />
          </span>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink-2">{drivers.tag}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-4xl">{drivers.title}</h3>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-2">{drivers.body}</p>
          <Link
            href={`/${lang}/register`}
            className="mt-8 inline-flex h-14 items-center justify-between gap-3 rounded-2xl bg-ink px-6 font-semibold text-surface transition hover:bg-dark-2 sm:pr-4"
          >
            {drivers.cta}
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-ink transition group-hover:translate-x-0.5">
              <Icon name="arrowRight" className="size-4" />
            </span>
          </Link>
        </div>
        <ul className="relative space-y-3">
          {drivers.points.map((point) => (
            <li key={point} className="flex items-center gap-3 rounded-2xl bg-ink/[0.06] p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-brand">
                <Icon name="check" className="size-3.5" strokeWidth={3} />
              </span>
              <span className="font-medium">{point}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
