import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import { carColors } from "@/data/car-colors";
import { fieldId } from "./parts";

export function ColorPicker({
  t,
  value,
  onChange,
}: {
  t: RegisterDictionary;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm font-semibold">{t.fields["car-color"].label}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {carColors.map((c, i) => (
          <label key={c.id} className="relative cursor-pointer">
            <input
              id={i === 0 ? fieldId("car-color") : undefined}
              type="radio"
              name="car-color"
              value={c.value}
              checked={value === c.value}
              onChange={() => onChange(c.value)}
              className="peer sr-only"
            />
            <span className="flex h-12 items-center gap-2.5 rounded-xl border border-line px-3 text-sm font-medium transition hover:border-ink-2 peer-checked:border-ink peer-checked:bg-brand-tint peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
              <span className="size-5 shrink-0 rounded-full ring-1 ring-ink/20" style={{ backgroundColor: c.hex }} />
              <span className="truncate">{t.colors[c.id]}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
