import type { Locale } from "@/i18n/config";
import type { CarCheckDictionary } from "@/i18n/dictionaries/carcheck-en";
import type { TariffsDictionary } from "@/i18n/dictionaries/tariffs-en";
import { carClasses, type CarClass } from "@/data/car-classes";
import { CarChecker } from "../CarChecker";
import { SectionHead } from "./SectionHead";

export function CarCheck({
  t,
  tariffItems,
  lang,
  showTariffsLink = false,
}: {
  t: CarCheckDictionary;
  tariffItems: TariffsDictionary["items"];
  lang: Locale;
  showTariffsLink?: boolean;
}) {
  const names = Object.fromEntries(carClasses.map((c) => [c, tariffItems[c].name])) as Record<CarClass, string>;

  return (
    <section id="car-check" aria-labelledby="car-check-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead id="car-check-title" label={t.label} title={t.title} />
        <p className="max-w-md text-muted">{t.lead}</p>
      </div>
      <div className="mt-10">
        <CarChecker t={t} names={names} lang={lang} showTariffsLink={showTariffsLink} />
      </div>
    </section>
  );
}
