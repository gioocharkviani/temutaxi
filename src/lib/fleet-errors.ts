// Turns a refusal from Yandex into something the applicant can act on. No database or network here.
// Yandex documents only a free-text `code` and `message` for this endpoint, so they are matched by keywords.

export type FleetErrorKind =
  | "licenseDuplicate"
  | "phoneDuplicate"
  | "duplicate"
  | "licenseInvalid"
  | "dateInvalid"
  | "phoneInvalid"
  | "nameInvalid"
  | "tooMany"
  | "other";

/** The form field each kind points to, so the form can move the cursor there. */
export const FLEET_ERROR_FIELD: Partial<Record<FleetErrorKind, string>> = {
  licenseDuplicate: "license-series",
  licenseInvalid: "license-series",
  dateInvalid: "issue-date",
  phoneDuplicate: "user-phone",
  phoneInvalid: "user-phone",
  nameInvalid: "user-name",
};

const DUPLICATE = /duplicat|already|exist|conflict|not[_ ]unique|unique|taken|used|дубл|уже|существ|занят|использ/;
const INVALID = /invalid|incorrect|wrong|format|malformed|not[_ ]valid|bad|некоррект|неверн|неправильн|формат|недопуст/;
const LICENSE = /licen[cs]e|\blicense|driver_license|\bdl\b|вод.{0,3}удостов|удостоверени|(^|[^а-яё])ву([^а-яё]|$)/;
const DATE = /date|expir|issue|дат|срок|выдач/;
const PHONE = /phone|телефон|номер тел/;
const NAME = /first_name|last_name|middle_name|\bname\b|имя|фамил|отчеств|фио/;

export function classifyFleetError(status: number, code = "", message = ""): FleetErrorKind {
  if (status === 429) return "tooMany";
  const text = `${code} ${message}`.toLowerCase();
  const duplicate = status === 409 || DUPLICATE.test(text);

  if (duplicate && LICENSE.test(text)) return "licenseDuplicate";
  if (duplicate && PHONE.test(text)) return "phoneDuplicate";
  if (LICENSE.test(text) && DATE.test(text)) return "dateInvalid";
  if (LICENSE.test(text) && INVALID.test(text)) return "licenseInvalid";
  if (PHONE.test(text) && INVALID.test(text)) return "phoneInvalid";
  if (NAME.test(text) && INVALID.test(text)) return "nameInvalid";
  if (DATE.test(text) && INVALID.test(text)) return "dateInvalid";
  if (duplicate && status < 500) return "duplicate";
  return "other";
}

/** Yandex's own text is shown only for refusals about the application itself, never for our key or their server. */
export const showsYandexText = (status: number) => status === 400 || status === 409 || status === 422;
