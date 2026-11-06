import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import type { CarClass } from "@/data/car-classes";
import { carColors } from "@/data/car-colors";
import { site } from "@/config/site";
import type { RegistrationValues } from "@/lib/registration";
import { Icon } from "../Icon";

/** The dark panel beside the form on desktop: the car and tariff chosen so far. */
export function ApplicationSummary({
  t,
  names,
  values,
  tariff,
}: {
  t: RegisterDictionary;
  names: Record<CarClass, string>;
  values: RegistrationValues;
  tariff: string;
}) {
  const carLabel = [values["car-make"], values["car-model"], values["car-year"]].filter((s) => s.trim()).join(" ");
  const color = carColors.find((c) => c.value === values["car-color"]);

  return (
    <aside className="hidden rounded-[28px] bg-dark p-7 text-surface lg:sticky lg:top-24 lg:block">
      <p className="font-display text-xl">{t.summary.title}</p>
      <dl className="mt-6 space-y-5">
        <div>
          <dt className="text-sm text-on-dark-muted">{t.summary.car}</dt>
          <dd className="mt-1 flex items-center gap-2 font-semibold">
            {color && <span className="size-4 shrink-0 rounded-full ring-1 ring-surface/30" style={{ backgroundColor: color.hex }} />}
            {carLabel || <span className="font-normal text-on-dark-muted">{t.summary.carEmpty}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-on-dark-muted">{t.summary.tariff}</dt>
          <dd className="mt-1 font-semibold">
            {tariff ? (
              <span className="text-brand">{names[tariff as CarClass]}</span>
            ) : (
              <span className="font-normal text-on-dark-muted">{t.summary.tariffEmpty}</span>
            )}
          </dd>
        </div>
      </dl>
      <a
        href={site.whatsapp.href}
        target="_blank"
        rel="noopener"
        className="mt-6 flex items-center gap-2 border-t border-dark-3 pt-5 text-sm text-on-dark-muted transition hover:text-brand"
      >
        <Icon name="message" className="size-4 shrink-0" />
        {t.summary.help}
      </a>
    </aside>
  );
}
