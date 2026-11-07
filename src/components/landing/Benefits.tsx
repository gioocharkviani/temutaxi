import type { Dictionary } from "@/i18n/dictionaries/en";
import { Icon, type IconName } from "../Icon";
import { SectionHead } from "./SectionHead";

// Same order as dictionary benefits.items
const icons: IconName[] = ["smartphone", "zap", "headset", "mapPin", "gift", "shield"];

export function Benefits({ t }: { t: Dictionary["benefits"] }) {
  return (
    <section id="benefits" aria-labelledby="benefits-title" className="bg-surface">
      <div className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHead id="benefits-title" label={t.label} title={t.title} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <li
              key={item.title}
              className="group rounded-3xl border border-line-soft bg-surface-2 p-6 transition hover:-translate-y-0.5 hover:border-line hover:bg-surface hover:shadow-xl hover:shadow-ink/5 sm:p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-ink ring-1 ring-line transition group-hover:bg-brand group-hover:ring-brand">
                <Icon name={icons[i]} className="size-6" />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
