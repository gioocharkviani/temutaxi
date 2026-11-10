"use client";

import { useState, useTransition } from "react";
import { generateReferral, type ReferralResult } from "@/app/[lang]/referral/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Icon } from "./Icon";

export function ReferralGenerator({ t, lang }: { t: Dictionary["referral"]; lang: Locale }) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<ReferralResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);
    startTransition(async () => setResult(await generateReferral(phone, lang)));
  };

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Some browsers block the clipboard API; copying the selected field still works there.
      const field = document.getElementById("referral-link") as HTMLInputElement | null;
      field?.select();
      if (field && document.execCommand("copy")) setCopied(true);
    }
  };

  const share = async (link: string) => {
    try {
      await navigator.share({ title: "TemuTaxi", text: t.shareText, url: link });
    } catch {
      // Cancelled or not supported.
    }
  };

  const error =
    result && result.status !== "ok"
      ? { invalid: t.invalid, notDriver: t.notDriver, tooMany: t.tooMany, error: t.failed }[result.status]
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form onSubmit={submit} className="rounded-[28px] border border-line bg-surface p-6 sm:p-8">
        <label htmlFor="referral-phone" className="block text-sm font-semibold">{t.phoneLabel}</label>
        <input
          id="referral-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={24}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s()-]/g, ""))}
          placeholder="+995 5XX XX XX XX"
          aria-describedby="referral-phone-hint"
          className="mt-2 h-14 w-full rounded-2xl border border-line bg-transparent px-4 text-base outline-none transition placeholder:text-faint focus:border-ink"
        />
        <p id="referral-phone-hint" className="mt-2 text-xs leading-relaxed text-muted">{t.phoneHint}</p>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 font-semibold text-surface transition hover:bg-dark-2 disabled:opacity-60"
        >
          {pending ? t.generating : t.generate}
        </button>
        <div aria-live="polite">
          {error && <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-4 text-sm font-medium text-danger">{error}</p>}
        </div>
      </form>

      <div className="rounded-[28px] bg-dark p-6 text-surface sm:p-8">
        {result?.status === "ok" ? (
          <div className="space-y-5">
            <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${result.verified ? "bg-up-soft text-up" : "bg-dark-2 text-on-dark-muted"}`}>
              {result.verified && <Icon name="badgeCheck" className="size-4" />}
              {result.verified ? t.verified : t.notVerified}
            </p>
            <div>
              <p className="text-sm text-on-dark-muted">{t.linkLabel}</p>
              <div className="mt-2 flex gap-2">
                <input id="referral-link" readOnly value={result.link} onFocus={(e) => e.currentTarget.select()} aria-label={t.linkLabel} className="h-12 min-w-0 flex-1 rounded-xl bg-dark-2 px-3 text-sm text-surface outline-none" />
                <button type="button" onClick={() => copy(result.link)} className="h-12 shrink-0 rounded-xl bg-brand px-4 text-sm font-semibold text-ink transition hover:bg-brand-hover">
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated data URL, nothing for next/image to optimise */}
              <img src={result.qr} alt={t.qrAlt} width={200} height={200} className="size-48 rounded-2xl bg-surface p-2" />
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <a href={result.qr} download="temutaxi-referral-qr.png" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-3 px-4 text-sm font-semibold transition hover:border-on-dark-muted">
                  {t.downloadQr}
                </a>
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button type="button" onClick={() => share(result.link)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-3 px-4 text-sm font-semibold transition hover:border-on-dark-muted">
                    {t.share}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand text-ink">
              <Icon name="users" className="size-7" />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-on-dark-muted">{t.emptyResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
