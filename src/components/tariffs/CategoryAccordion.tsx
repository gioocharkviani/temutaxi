"use client";

import { useId, useState } from "react";
import type { TariffsDictionary } from "@/i18n/dictionaries/tariffs-en";
import { fill } from "@/i18n/fill";
import { carClasses, type CarClass, type CarModel } from "@/data/car-classes";
import { tariffs } from "@/data/tariffs";
import { Icon } from "../Icon";

const iconFor = (c: CarClass) => tariffs.find((t) => t.id === c)?.icon ?? "car";

const rowsFor = (cars: CarModel[], c: CarClass) =>
  cars
    .filter((m) => typeof m.years[c] === "number")
    .map((m) => ({ name: `${m.brand} ${m.model}`, from: m.years[c] as number }))
    .sort((a, b) => a.name.localeCompare(b.name));

// Mirrors the Yandex Pro layout: one row per category that expands into its car list.
export type AccordionText = {
  models: TariffsDictionary["models"];
  items: Record<CarClass, { name: string; tagline: string }>;
};

export function CategoryAccordion({ t, cars }: { t: AccordionText; cars: CarModel[] }) {
  const [open, setOpen] = useState<CarClass | null>("economy");
  const [query, setQuery] = useState("");
  const baseId = useId();
  const m = t.models;

  const toggle = (c: CarClass) => {
    setOpen(open === c ? null : c);
    setQuery("");
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
      {carClasses.map((c, i) => {
        const isOpen = open === c;
        const all = rowsFor(cars, c);
        const q = query.trim().toLowerCase();
        // Lists can hold over a thousand rows, so only the open category goes on the page.
        const rows = !isOpen ? [] : q ? all.filter((r) => r.name.toLowerCase().includes(q)) : all;
        const btnId = `${baseId}-${c}-btn`;
        const panelId = `${baseId}-${c}-panel`;
        const copy = t.items[c];

        return (
          <div key={c} className={i > 0 ? "border-t border-line-soft" : ""}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(c)}
                className={`flex w-full items-center gap-4 px-5 py-4 text-left font-sans transition-colors sm:px-7 sm:py-5 ${
                  isOpen ? "bg-brand-tint" : "hover:bg-surface-2"
                }`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                    isOpen ? "bg-brand text-ink" : "bg-ink text-brand"
                  }`}
                >
                  <Icon name={iconFor(c)} className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold">{copy.name}</span>
                  <span className="block truncate text-sm text-muted">{copy.tagline}</span>
                </span>
                <span className="hidden rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-2 sm:inline">
                  {fill(m.count, { n: all.length })}
                </span>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "rotate-180 bg-ink text-brand" : "bg-surface-2 text-ink"
                  }`}
                >
                  <Icon name="chevronDown" className="size-4" strokeWidth={2.5} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`px-5 pb-6 pt-4 transition duration-500 sm:px-7 ${
                    isOpen ? "translate-y-0 opacity-100 delay-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm font-medium text-ink-2">{(m.notes as Partial<Record<CarClass, string>>)[c]}</p>
                    <label className="relative block md:w-72">
                      <span className="sr-only">{m.search}</span>
                      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
                      <input
                        type="search"
                        value={isOpen ? query : ""}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={m.search}
                        className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm outline-none transition focus:border-ink"
                      />
                    </label>
                  </div>

                  <div className="mt-4 max-h-[440px] overflow-y-auto rounded-2xl border border-line-soft">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-surface-2">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-medium text-muted">{m.brandModel}</th>
                          <th scope="col" className="w-40 px-4 py-3 font-medium text-muted sm:w-56">{m.year}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.name} className="border-t border-line-soft transition-colors hover:bg-brand-tint">
                            <td className="px-4 py-3 font-medium">{r.name}</td>
                            <td className="px-4 py-3 tabular-nums text-ink-2">{fill(m.fromYear, { year: r.from })}</td>
                          </tr>
                        ))}
                        {rows.length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-muted">
                              {m.noResults}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
