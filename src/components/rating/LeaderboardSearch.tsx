"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { searchLeaderboard, type SearchResult } from "@/app/[lang]/leaderboard/actions";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { plural, type PluralForms } from "@/i18n/plural";

export type SearchText = {
  label: string;
  placeholder: string;
  button: string;
  tooShort: string;
  phoneShort: string;
  empty: string;
  more: string;
  unavailable: string;
  place: string;
  inTop: string;
  orders: PluralForms;
  searching: string;
};

const DELAY_MS = 300;
const MIN_LENGTH = 3;

/**
 * Shows the driver's place and orders while they type. The form still works without JavaScript:
 * it sends ?q= and the page renders the same result on the server.
 */
export function LeaderboardSearch({
  lang,
  t,
  initialQuery,
  initialResult,
}: {
  lang: Locale;
  t: SearchText;
  initialQuery: string;
  initialResult: SearchResult | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [pending, startTransition] = useTransition();
  const latest = useRef(0);

  const run = (value: string) => {
    const request = ++latest.current;
    const trimmed = value.trim();
    // Keeps the address shareable without reloading the page.
    window.history.replaceState(null, "", trimmed ? `?q=${encodeURIComponent(trimmed)}` : window.location.pathname);
    if (!trimmed) {
      setResult(null);
      return;
    }
    startTransition(async () => {
      const next = await searchLeaderboard(trimmed);
      // An older, slower answer must not replace a newer one.
      if (request === latest.current) setResult(next);
    });
  };

  // Waits until typing pauses, so one request covers a whole word.
  useEffect(() => {
    if (query.trim() === initialQuery.trim()) return;
    const timer = setTimeout(() => run(query), DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      <form
        action=""
        onSubmit={(event) => {
          event.preventDefault();
          run(query);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={60}
          autoComplete="off"
          aria-label={t.label}
          placeholder={t.placeholder}
          className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 outline-none transition focus:border-ink"
        />
        <button type="submit" className="h-12 shrink-0 rounded-2xl bg-ink px-5 font-semibold text-surface transition hover:bg-dark-2">
          {t.button}
        </button>
      </form>

      <div className="mt-4" aria-live="polite" aria-busy={pending}>
        {pending && !result && <p className="text-sm text-ink-2">{t.searching}</p>}
        {result && (
          <div className={`transition-opacity ${pending ? "opacity-60" : ""}`}>
            <Result result={result} t={t} lang={lang} />
          </div>
        )}
      </div>
    </>
  );
}

function Result({ result, t, lang }: { result: SearchResult; t: SearchText; lang: Locale }) {
  if (result.status === "short") return <p className="text-sm font-medium">{fill(t.tooShort, { n: MIN_LENGTH })}</p>;
  if (result.status === "phoneShort") return <p className="text-sm font-medium">{t.phoneShort}</p>;
  if (result.status === "unavailable") return <p className="text-sm font-medium">{t.unavailable}</p>;
  if (result.rows.length === 0) return <p className="text-sm font-medium">{t.empty}</p>;

  return (
    <>
      <ul className="space-y-2">
        {result.rows.map((row, index) => (
          <li key={`${row.position}-${index}`} className="flex items-center gap-3 rounded-2xl bg-surface p-3.5">
            <span className="w-12 shrink-0 text-center">
              <strong className="block font-display text-2xl leading-none tabular-nums">{row.position}</strong>
              <span className="text-[11px] text-muted">{t.place}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{row.name}</span>
              {row.position <= result.pageCount && <span className="text-xs text-up">{fill(t.inTop, { n: result.pageCount })}</span>}
            </span>
            {row.prize !== null && <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold">{row.prize} ₾</span>}
            <span className="shrink-0 text-right">
              <strong className="font-display text-xl tabular-nums">{row.score}</strong>{" "}
              <span className="text-xs text-muted">{plural(t.orders, row.score, lang)}</span>
            </span>
          </li>
        ))}
      </ul>
      {result.limited !== null && <p className="mt-3 text-xs text-ink-2">{fill(t.more, { n: result.limited })}</p>}
    </>
  );
}
