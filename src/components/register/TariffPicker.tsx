import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import { fill } from "@/i18n/fill";
import { carClasses, type CarClass } from "@/data/car-classes";
import { tariffs } from "@/data/tariffs";
import type { TariffState } from "@/lib/registration";
import { Icon } from "../Icon";
import { errorId, ErrorText, fieldId, Notice } from "./parts";

/** Locked until the car is complete; then only the tariffs that fit the car can be selected. */
export function TariffPicker({
  t,
  names,
  state,
  selected,
  carKey,
  error,
  onChange,
}: {
  t: RegisterDictionary;
  names: Record<CarClass, string>;
  state: TariffState;
  selected: string;
  /** Changes with the car, which replays the entrance animation. */
  carKey: string;
  error?: string;
  onChange: (tariff: CarClass) => void;
}) {
  const canChoose = state.status === "ready" && state.available.length > 0;
  const firstAvailable = state.status === "ready" ? state.available[0] : undefined;

  return (
    <>
      <div aria-live="polite">
        {state.status === "locked" && (
          <Notice icon="lock" title={t.tariff.lockedTitle}>
            {fill(t.tariff.missing, { fields: state.missing.map((f) => t.fields[f].label).join(", ") })}
          </Notice>
        )}
        {state.status === "unknown" && (
          <Notice icon="info" title={t.tariff.unknownTitle}>
            {t.tariff.unknownBody}
          </Notice>
        )}
        {state.status === "ready" && state.available.length === 0 && (
          <Notice icon="info" title={t.tariff.noneTitle}>
            {t.tariff.noneBody}
          </Notice>
        )}
      </div>

      <fieldset
        key={canChoose ? carKey : "locked"}
        className="mt-4 grid gap-3 sm:grid-cols-2"
        aria-label={t.sections.tariff.title}
        aria-describedby={error ? errorId("tariff") : undefined}
      >
        {carClasses.map((c, i) => {
          const result = state.status === "ready" ? state.results[i] : undefined;
          const isSelected = selected === c;
          const icon = tariffs.find((x) => x.id === c)?.icon ?? "car";
          return (
            <label
              key={c}
              style={canChoose ? { animationDelay: `${i * 50}ms` } : undefined}
              className={`relative ${canChoose ? "tariff-card-in" : ""} ${result?.ok ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <input
                id={c === firstAvailable ? fieldId("tariff") : undefined}
                type="radio"
                name="tariff"
                value={c}
                disabled={!result?.ok}
                checked={isSelected}
                onChange={() => onChange(c)}
                className="peer sr-only"
              />
              <span
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
                  isSelected
                    ? "border-ink bg-brand-tint"
                    : result?.ok
                      ? "border-brand hover:bg-brand-tint"
                      : "border-line-soft bg-surface-2"
                }`}
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    result?.ok ? "bg-brand text-ink" : "bg-surface text-faint ring-1 ring-line-soft"
                  }`}
                >
                  <Icon name={icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-semibold ${result?.ok ? "text-ink" : "text-muted"}`}>{names[c]}</span>
                  {result && (
                    <span className={`block text-xs ${result.ok ? "text-up" : "text-muted"}`}>
                      {result.ok
                        ? t.tariff.available
                        : result.from
                          ? fill(t.tariff.fromYear, { year: result.from })
                          : t.tariff.notForModel}
                    </span>
                  )}
                </span>
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? "bg-ink text-brand" : result?.ok ? "border-2 border-line" : "text-faint"
                  }`}
                >
                  {isSelected ? (
                    <Icon name="check" className="size-3.5" strokeWidth={3} />
                  ) : (
                    !result?.ok && <Icon name="lock" className="size-3.5" />
                  )}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <ErrorText field="tariff" error={error} />
    </>
  );
}
