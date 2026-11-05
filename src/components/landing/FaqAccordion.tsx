"use client";

import { useId, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Icon } from "../Icon";

// One question open at a time; height animates via grid-template-rows 0fr -> 1fr.
export function FaqAccordion({ items }: { items: Dictionary["faq"]["items"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div
            key={item.q}
            className={`rounded-3xl border transition-[background-color,border-color,box-shadow] duration-300 ${
              open ? "border-ink/10 bg-surface shadow-xl shadow-ink/5" : "border-line bg-surface hover:border-ink-2/30"
            }`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center gap-4 rounded-3xl p-5 text-left font-sans text-base font-semibold sm:p-6 sm:text-lg"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums transition-colors duration-300 ${
                    open ? "bg-ink text-brand" : "bg-surface-2 text-faint"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{item.q}</span>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "rotate-45 bg-brand text-ink" : "bg-surface-2 text-ink"
                  }`}
                >
                  <Icon name="plus" className="size-4" strokeWidth={2.5} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p
                  className={`px-5 pb-6 leading-relaxed text-muted transition duration-500 sm:pl-[72px] sm:pr-6 ${
                    open ? "translate-y-0 opacity-100 delay-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
