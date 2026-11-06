// Small building blocks of the registration form.

import type { ReactNode } from "react";
import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import type { RegistrationField, TextField } from "@/lib/registration";
import { Icon } from "../Icon";

export const fieldId = (f: RegistrationField) => `reg-${f}`;
export const errorId = (f: RegistrationField) => `reg-${f}-error`;

export function Section({ n, title, hint, children }: { n: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-surface p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink font-bold text-brand">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{hint}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Field({
  field,
  t,
  error,
  required = false,
  className = "",
  children,
}: {
  field: TextField;
  t: RegisterDictionary;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={fieldId(field)} className="mb-2 block text-sm font-semibold">
        {t.fields[field].label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        )}
      </label>
      {children}
      <ErrorText field={field} error={error} />
    </div>
  );
}

export function ErrorText({ field, error }: { field: RegistrationField; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(field)} className="mt-2 text-sm text-danger">
      {error}
    </p>
  );
}

export function Notice({ icon, title, children }: { icon: "lock" | "info"; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-muted ring-1 ring-line-soft">
        <Icon name={icon} className="size-4" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}
