export const carClasses = [
  "economy",
  "comfort",
  "comfortPlus",
  "electro",
  "minivan",
  "business",
] as const;
export type CarClass = (typeof carClasses)[number];

export type ClassYears = Partial<Record<CarClass, number | null>>;

export type CarModel = { brand: string; model: string; years: ClassYears };

export const MIN_YEAR = 1999;
export const MAX_YEAR = 2026;

export const isValidYear = (value: string) =>
  /^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= MAX_YEAR;

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export const brandsOf = (cars: CarModel[]) =>
  [...new Set(cars.map((c) => c.brand))].sort();

export const modelsFor = (cars: CarModel[], brand: string) =>
  cars.filter((c) => same(c.brand, brand));

export const findCar = (cars: CarModel[], brand: string, model: string) =>
  cars.find((c) => same(c.brand, brand) && same(c.model, model));

export const classResults = (car: CarModel | undefined, year: number) =>
  carClasses.map((c) => {
    const from = car?.years[c];
    return { c, from, ok: typeof from === "number" && year >= from };
  });
