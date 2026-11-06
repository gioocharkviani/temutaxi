import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import { Icon } from "../Icon";

export function SuccessMessage({ t, lang }: { t: RegisterDictionary; lang: Locale }) {
  return (
    <div className="tariff-card-in mx-auto max-w-xl rounded-[32px] border border-line bg-surface p-8 text-center sm:p-12">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-up text-surface">
        <Icon name="check" className="size-8" strokeWidth={3} />
      </span>
      <h2 ref={(el) => el?.focus()} tabIndex={-1} className="mt-6 text-3xl font-bold tracking-tight outline-none">
        {t.success.title}
      </h2>
      <p role="status" className="mt-3 leading-relaxed text-muted">
        {t.success.body}
      </p>
      <Link
        href={`/${lang}`}
        className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-7 font-semibold text-surface transition hover:bg-dark-2"
      >
        {t.success.home}
        <Icon name="arrowRight" className="size-5 text-brand" />
      </Link>
    </div>
  );
}
