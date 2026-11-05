import { carClasses, classResults, findCar, MAX_YEAR, type CarClass } from "@/data/car-classes";
import { carColors } from "@/data/car-colors";

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

export type RegistrationError = "required" | "phone" | "date" | "expiryOrder" | "year" | "color" | "tariff" | "consent";
export type RegistrationErrors = Partial<Record<RegistrationField, RegistrationError>>;

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

const MAX_LENGTH = 120;

export const isValidYear = (value: string) => /^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= MAX_YEAR;

/** Accepts 5XX XX XX XX or +995 5XX XX XX XX, with any spacing. */
const isValidPhone = (value: string) => /^(\+?995)?5\d{8}$/.test(value.replace(/[\s()-]/g, ""));

/** Parses DD.MM.YYYY to a timestamp; null when the date does not exist. */
function parseDate(value: string): number | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date.getTime() : null;
}

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

export function getTariffState(v: RegistrationValues): TariffState {
  const missing = (["car-make", "car-model", "car-year", "car-color"] as const).filter((f) =>
    f === "car-year" ? !isValidYear(v[f]) : !v[f].trim(),
  );
  if (missing.length) return { status: "locked", missing };

  const car = findCar(v["car-make"], v["car-model"]);
  if (!car) return { status: "unknown" };

  const results = classResults(car, Number(v["car-year"]));
  return { status: "ready", results, available: results.filter((r) => r.ok).map((r) => r.c) };
}

/** The chosen tariff if it still fits the car; a single available tariff is selected automatically. */
export function effectiveTariff(v: RegistrationValues, state = getTariffState(v)) {
  if (state.status !== "ready") return "";
  if ((state.available as string[]).includes(v.tariff)) return v.tariff;
  return state.available.length === 1 ? state.available[0] : "";
}

export function validateRegistration(v: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {};

  // Same as the original form: only name and phone are mandatory, the rest is checked when filled in.
  if (v["user-name"].trim().length < 2) errors["user-name"] = "required";
  if (!v["user-phone"].trim()) errors["user-phone"] = "required";
  else if (!isValidPhone(v["user-phone"])) errors["user-phone"] = "phone";

  const issue = parseDate(v["issue-date"]);
  const expiry = parseDate(v["expiration-date"]);
  if (v["issue-date"] && issue === null) errors["issue-date"] = "date";
  if (v["expiration-date"] && expiry === null) errors["expiration-date"] = "date";
  else if (issue !== null && expiry !== null && expiry <= issue) errors["expiration-date"] = "expiryOrder";

  if (v["car-year"] && !isValidYear(v["car-year"])) errors["car-year"] = "year";
  if (v["car-color"] && !carColors.some((c) => c.value === v["car-color"])) errors["car-color"] = "color";

  const state = getTariffState(v);
  if (state.status === "ready" && state.available.length > 0 && !effectiveTariff(v, state)) errors.tariff = "tariff";
  if (v.tariff && state.status === "ready" && state.available.length === 0) errors.tariff = "tariff";

  if (!v.consent) errors.consent = "consent";
  return errors;
}

/** Builds values from an untrusted request body; null when the shape is wrong. */
export function parseRegistration(body: unknown): RegistrationValues | null {
  if (typeof body !== "object" || body === null) return null;
  const input = body as Record<string, unknown>;
  const values: RegistrationValues = { ...emptyRegistration, consent: input.consentAccepted === true };

  for (const field of [...textFields, "tariff"] as const) {
    const raw = input[field];
    if (raw === undefined || raw === "") continue;
    if (typeof raw !== "string" || raw.length > MAX_LENGTH) return null;
    values[field] = raw.trim();
  }
  if (values.tariff && !(carClasses as readonly string[]).includes(values.tariff)) return null;
  return values;
}

/** The JSON sent from the form, in the same shape as the original form's payload. */
export function toPayload(v: RegistrationValues, requestId: string) {
  const fields = Object.fromEntries(textFields.map((f) => [f, v[f].trim()]).filter(([, value]) => value));
  const tariff = effectiveTariff(v);
  return { ...fields, ...(tariff ? { tariff } : {}), formType: "taxi-form", requestId, consentAccepted: v.consent };
}
