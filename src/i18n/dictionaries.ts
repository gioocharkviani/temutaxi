import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import type { TariffsDictionary } from "./dictionaries/tariffs-en";
import type { CarCheckDictionary } from "./dictionaries/carcheck-en";
import type { RegisterDictionary } from "./dictionaries/register-en";
import type { PrivacyDictionary } from "./dictionaries/privacy-en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ka: () => import("./dictionaries/ka").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
  ru: () => import("./dictionaries/ru").then((m) => m.default),
};

const tariffDictionaries: Record<Locale, () => Promise<TariffsDictionary>> = {
  ka: () => import("./dictionaries/tariffs-ka").then((m) => m.default),
  en: () => import("./dictionaries/tariffs-en").then((m) => m.default),
  ru: () => import("./dictionaries/tariffs-ru").then((m) => m.default),
};

const carCheckDictionaries: Record<Locale, () => Promise<CarCheckDictionary>> = {
  ka: () => import("./dictionaries/carcheck-ka").then((m) => m.default),
  en: () => import("./dictionaries/carcheck-en").then((m) => m.default),
  ru: () => import("./dictionaries/carcheck-ru").then((m) => m.default),
};

const registerDictionaries: Record<Locale, () => Promise<RegisterDictionary>> = {
  ka: () => import("./dictionaries/register-ka").then((m) => m.default),
  en: () => import("./dictionaries/register-en").then((m) => m.default),
  ru: () => import("./dictionaries/register-ru").then((m) => m.default),
};

const privacyDictionaries: Record<Locale, () => Promise<PrivacyDictionary>> = {
  ka: () => import("./dictionaries/privacy-ka").then((m) => m.default),
  en: () => import("./dictionaries/privacy-en").then((m) => m.default),
  ru: () => import("./dictionaries/privacy-ru").then((m) => m.default),
};

export const getPrivacyDictionary = (locale: Locale) => privacyDictionaries[locale]();
export const getRegisterDictionary = (locale: Locale) => registerDictionaries[locale]();
export const getDictionary = (locale: Locale) => dictionaries[locale]();
export const getTariffsDictionary = (locale: Locale) => tariffDictionaries[locale]();
export const getCarCheckDictionary = (locale: Locale) => carCheckDictionaries[locale]();
export type { Dictionary, TariffsDictionary, CarCheckDictionary };
