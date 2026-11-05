import type { TariffsDictionary } from "@/i18n/dictionaries/tariffs-en";
import { formatGel, tariffs, type Tariff } from "@/data/tariffs";
import { Icon } from "../Icon";
import { SectionHead } from "../landing/SectionHead";

export function TariffCompare({ t }: { t: TariffsDictionary }) {
  const l = t.labels;
  const rows: { label: string; value: (x: Tariff) => string }[] = [
    { label: l.from, value: (x) => formatGel(x.start) },
    { label: l.perKm, value: (x) => formatGel(x.perKm) },
    { label: l.perMin, value: (x) => formatGel(x.perMin) },
    { label: l.freeWait, value: (x) => `${x.freeWait} ${l.minutes}` },
    { label: l.paidWait, value: (x) => `${formatGel(x.paidWait)}${l.perMinShort}` },
    { label: l.seats, value: (x) => (x.seats ? String(x.seats) : l.none) },
    { label: l.minYear, value: (x) => (x.minYear ? `${x.minYear}+` : l.none) },
  ];

  return (
    <section aria-labelledby="compare-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHead id="compare-title" label={l.compareLabel} title={l.compareTitle} />

      <div className="mt-10 overflow-x-auto rounded-[28px] border border-line bg-surface [scrollbar-width:thin]">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="sticky left-0 z-10 bg-surface px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
                {l.tariff}
              </th>
              {tariffs.map((x) => (
                <th key={x.id} scope="col" className={`px-4 py-4 ${x.popular ? "bg-brand-tint" : ""}`}>
                  <span className="flex items-center gap-2">
                    <span className={`flex size-8 items-center justify-center rounded-xl ${x.popular ? "bg-brand text-ink" : "bg-ink text-brand"}`}>
                      <Icon name={x.icon} className="size-4" />
                    </span>
                    <span className="font-sans text-sm font-bold">{t.items[x.id].name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line-soft transition-colors last:border-0 hover:bg-surface-2">
                <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-surface px-5 py-3.5 font-medium text-muted">
                  {row.label}
                </th>
                {tariffs.map((x) => (
                  <td key={x.id} className={`whitespace-nowrap px-4 py-3.5 font-semibold tabular-nums ${x.popular ? "bg-brand-tint/70" : ""}`}>
                    {row.value(x)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
