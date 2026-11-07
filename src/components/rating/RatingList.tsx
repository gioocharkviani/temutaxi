import type { Locale } from "@/i18n/config";
import { plural, type PluralForms } from "@/i18n/plural";
import type { PublicRow } from "@/lib/rating/service";

/** The ranked rows, used on the dark landing section and the light rating page. */
export function RatingList({
  rows,
  showScores,
  orders,
  lang,
  tone,
}: {
  rows: PublicRow[];
  showScores: boolean;
  orders: PluralForms;
  lang: Locale;
  tone: "dark" | "light";
}) {
  const leaderScore = rows[0]?.score ?? 0;
  const base = tone === "dark" ? "bg-dark-2 text-surface" : "border border-line bg-surface text-ink";
  const accent = tone === "dark" ? "text-brand" : "text-ink";
  const quiet = tone === "dark" ? "text-on-dark-muted" : "text-muted";
  const track = tone === "dark" ? "bg-dark-3" : "bg-surface-2";
  const bar = tone === "dark" ? "bg-brand" : "bg-ink";

  return (
    <ol className="min-w-0 space-y-2">
      {rows.map((row, index) => {
        const first = row.position === 1;
        const podium = row.position <= 3;
        const share = leaderScore ? Math.max(4, Math.round((row.score / leaderScore) * 100)) : 0;
        return (
          <li
            key={`${row.position}-${index}`}
            className={`relative overflow-hidden rounded-2xl ${first ? "bg-brand text-ink" : base} ${podium ? "p-5 sm:p-6" : "px-5 py-3.5"}`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-10 shrink-0 font-display tabular-nums leading-none ${podium ? "text-4xl sm:text-5xl" : `text-lg ${quiet}`} ${
                  podium && !first ? accent : ""
                }`}
              >
                {row.position}
              </span>
              <span className={`min-w-0 flex-1 truncate font-semibold ${podium ? "text-lg sm:text-xl" : ""}`}>{row.name}</span>
              {row.prize !== null && (
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${first ? "bg-ink text-brand" : "bg-brand-soft text-ink"}`}>
                  {row.prize} ₾
                </span>
              )}
              {showScores && (
                <span className="shrink-0 text-right">
                  <strong className={`font-display tabular-nums ${podium ? "text-2xl" : "text-lg"}`}>{row.score}</strong>{" "}
                  <span className={`text-xs ${first ? "text-ink-2" : quiet}`}>{plural(orders, row.score, lang)}</span>
                </span>
              )}
            </div>
            {showScores && (
              <div aria-hidden="true" className={`mt-3 h-1 overflow-hidden rounded-full ${first ? "bg-ink/15" : track}`}>
                <div className={`h-full rounded-full ${first ? "bg-ink" : bar}`} style={{ width: `${share}%` }} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Holds the place of the rows while Yandex answers, so the page does not jump. */
export function RatingListSkeleton({ count, tone, label }: { count: number; tone: "dark" | "light"; label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`h-[92px] animate-pulse rounded-2xl ${tone === "dark" ? "bg-dark-2" : "bg-surface-2"}`} />
      ))}
    </div>
  );
}
