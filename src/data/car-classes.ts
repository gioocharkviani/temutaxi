export const carClasses = [
  "economy",
  "comfort",
  "comfortPlus",
  "electro",
  "minivan",
  "business",
] as const;
export type CarClass = (typeof carClasses)[number];

/** Minimum production year per class; null or a missing class means the model does not qualify. */
export type ClassYears = Partial<Record<CarClass, number | null>>;

export type CarModel = { brand: string; model: string; years: ClassYears };

// Oldest and newest year offered in the year picker.
export const MIN_YEAR = 1999;
export const MAX_YEAR = 2026;

/** Years typed by hand may predate MIN_YEAR, which only limits the picker. */
export const isValidYear = (value: string) =>
  /^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= MAX_YEAR;

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const brandsOf = (cars: CarModel[]) => [...new Set(cars.map((c) => c.brand))].sort();

export const modelsFor = (cars: CarModel[], brand: string) => cars.filter((c) => same(c.brand, brand));

/** Case-insensitive lookup, so free-typed values match the list. */
export const findCar = (cars: CarModel[], brand: string, model: string) =>
  cars.find((c) => same(c.brand, brand) && same(c.model, model));

/** Per class: the minimum year (if any) and whether a car of this year qualifies. */
export const classResults = (car: CarModel | undefined, year: number) =>
  carClasses.map((c) => {
    const from = car?.years[c];
    return { c, from, ok: typeof from === "number" && year >= from };
  });
