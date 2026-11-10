// The registration rules, shared by the form (instant feedback) and the API (the real check).

import { z } from "zod";
import { carClasses, isValidYear, type CarModel } from "@/data/car-classes";
import { carColors } from "@/data/car-colors";
import {
  effectiveTariff,
  getTariffState,
  textFields,
  type RegistrationField,
  type RegistrationValues,
  type TextField,
} from "./registration";

/** Error codes; the form shows the matching text from `errors` in the register dictionaries. */
export type RegistrationError =
  | "required"
  | "fullName"
  | "phone"
  | "date"
  | "expiryOrder"
  | "year"
  | "color"
  | "tariff"
  | "consent"
  | "referrerSelf";
export type RegistrationErrors = Partial<Record<RegistrationField, RegistrationError>>;

// Zod messages are used as the error codes; this makes a mistyped code fail the build.
const code = (error: RegistrationError) => error;

const MAX_LENGTH = 120;

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

const requiredText = () => z.string().trim().min(1, code("required"));
const realDate = () => requiredText().refine((s) => parseDate(s) !== null, code("date"));

// Rules for one field at a time. Name, phone and licence are what the Yandex Fleet API requires.
const fieldsSchema = z.object({
  "user-name": requiredText().refine((s) => s.split(/\s+/).length >= 2, code("fullName")),
  "user-phone": requiredText().refine(isValidPhone, code("phone")),
  "license-series": requiredText(),
  "issue-date": realDate(),
  "expiration-date": realDate(),
  "car-year": z.string().refine((s) => !s || isValidYear(s), code("year")),
  "car-color": z.string().refine((s) => !s || carColors.some((c) => c.value === s), code("color")),
  consent: z.boolean().refine(Boolean, code("consent")),
  "referrer-phone": z.string().refine((s) => !s.trim() || isValidPhone(s), code("phone")),
});

// Rules across fields. A separate schema because Zod skips an object's refinements while any of its
// fields is invalid, and the form should report these together with the other errors.
const crossFieldSchema = (cars: CarModel[]) => z.custom<RegistrationValues>().superRefine((v, ctx) => {
  const issue = parseDate(v["issue-date"]);
  const expiry = parseDate(v["expiration-date"]);
  if (issue !== null && expiry !== null && expiry <= issue) {
    ctx.addIssue({ code: "custom", path: ["expiration-date"], message: code("expiryOrder") });
  }

  // Referring yourself is not a referral.
  const digits = (s: string) => s.replace(/\D/g, "").slice(-9);
  if (v["referrer-phone"].trim() && digits(v["referrer-phone"]) === digits(v["user-phone"])) {
    ctx.addIssue({ code: "custom", path: ["referrer-phone"], message: code("referrerSelf") });
  }

  const state = getTariffState(v, cars);
  if (state.status !== "ready") return;
  const notChosen = state.available.length > 0 && !effectiveTariff(v, state);
  const noneFits = state.available.length === 0 && Boolean(v.tariff);
  if (notChosen || noneFits) {
    ctx.addIssue({ code: "custom", path: ["tariff"], message: code("tariff") });
  }
});

export function validateRegistration(v: RegistrationValues, cars: CarModel[]): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const issues = [
    ...(fieldsSchema.safeParse(v).error?.issues ?? []),
    ...(crossFieldSchema(cars).safeParse(v).error?.issues ?? []),
  ];
  // A field can fail several rules; the first one is the one to show.
  for (const { path, message } of issues) {
    errors[path[0] as RegistrationField] ??= message as RegistrationError;
  }
  return errors;
}

// The shape of the raw API request, before the rules above run.
const requestText = () => z.string().max(MAX_LENGTH).trim().default("");

const requestSchema = z
  .object({
    ...(Object.fromEntries(textFields.map((f) => [f, requestText()])) as Record<TextField, ReturnType<typeof requestText>>),
    tariff: z.union([z.enum(carClasses), z.literal("")]).default(""),
    consentAccepted: z.unknown().transform((value) => value === true),
  })
  .transform(({ consentAccepted, ...values }): RegistrationValues => ({ ...values, consent: consentAccepted }));

/** Reads values from an untrusted request body; null when the shape is wrong. */
export function parseRegistration(body: unknown): RegistrationValues | null {
  const result = requestSchema.safeParse(body);
  return result.success ? result.data : null;
}
