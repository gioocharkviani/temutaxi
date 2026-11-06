// The registration form's data: its fields, the tariff logic, and the JSON sent to the API.
// The validation rules are in registration-schema.ts.

import { classResults, findCar, isValidYear, type CarClass, type CarModel } from "@/data/car-classes";

// Field names match the original registration form, so the payload stays compatible with that backend.
export const textFields = [
  "user-name",
  "user-phone",
  "city",
  "license-series",
  "issue-date",
  "expiration-date",
  "car-make",
  "car-model",
  "car-year",
  "car-color",
  "vin-code",
  "car-number",
] as const;

export type TextField = (typeof textFields)[number];
export type RegistrationValues = Record<TextField, string> & { tariff: string; consent: boolean };
export type RegistrationField = TextField | "tariff" | "consent";

export const emptyRegistration: RegistrationValues = {
  "user-name": "",
  "user-phone": "",
  city: "",
  "license-series": "",
  "issue-date": "",
  "expiration-date": "",
  "car-make": "",
  "car-model": "",
  "car-year": "",
  "car-color": "",
  "vin-code": "",
  "car-number": "",
  tariff: "",
  consent: false,
};

/** Formats typed digits as DD.MM.YYYY. */
export function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join(".");
}

export type TariffState =
  /** Some car fields are still empty; `missing` lists them. */
  | { status: "locked"; missing: TextField[] }
  /** Brand/model are not in our list, so a manager has to check the car. */
  | { status: "unknown" }
  | { status: "ready"; results: ReturnType<typeof classResults>; available: CarClass[] };

export function getTariffState(v: RegistrationValues, cars: CarModel[]): TariffState {
  const missing = (["car-make", "car-model", "car-year", "car-color"] as const).filter((f) =>
    f === "car-year" ? !isValidYear(v[f]) : !v[f].trim(),
  );
  if (missing.length) return { status: "locked", missing };

  const car = findCar(cars, v["car-make"], v["car-model"]);
  if (!car) return { status: "unknown" };

  const results = classResults(car, Number(v["car-year"]));
  return { status: "ready", results, available: results.filter((r) => r.ok).map((r) => r.c) };
}

/** The chosen tariff if it still fits the car; a single available tariff is selected automatically. */
export function effectiveTariff(v: RegistrationValues, state: TariffState) {
  if (state.status !== "ready") return "";
  if ((state.available as string[]).includes(v.tariff)) return v.tariff;
  return state.available.length === 1 ? state.available[0] : "";
}

/** The JSON the form sends to the API. */
export function toPayload(v: RegistrationValues, tariff: string, requestId: string) {
  const fields = Object.fromEntries(textFields.map((f) => [f, v[f].trim()]).filter(([, value]) => value));
  return { ...fields, ...(tariff ? { tariff } : {}), formType: "taxi-form", requestId, consentAccepted: v.consent };
}
