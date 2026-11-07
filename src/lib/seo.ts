// Search engine settings: edited in the admin panel, with the dictionaries as the starting text.

import "server-only";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db/data-source";
import {
  SiteSettingsEntity,
  type SeoPageKey,
  type SeoSettings,
  type SeoText,
} from "@/db/entities";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import {
  getDictionary,
  getPrivacyDictionary,
  getRegisterDictionary,
  getTariffsDictionary,
} from "@/i18n/dictionaries";

export const SEO_TAG = "seo";

export const SEO_PAGE_PATHS: Record<SeoPageKey, string> = {
  home: "",
  tariffs: "/tariffs",
  register: "/register",
  rating: "/leaderboard",
  privacy: "/privacy",
};

const OG_LOCALES: Record<Locale, string> = {
  ka: "ka_GE",
  en: "en_US",
  ru: "ru_RU",
};

async function defaultTexts(
  lang: Locale,
): Promise<Record<SeoPageKey, SeoText>> {
  const [dict, tariffs, register, privacy] = await Promise.all([
    getDictionary(lang),
    getTariffsDictionary(lang),
    getRegisterDictionary(lang),
    getPrivacyDictionary(lang),
  ]);
  return {
    home: dict.meta,
    tariffs: tariffs.meta,
    register: register.meta,
    rating: {
      title: dict.rating.metaTitle,
      description: dict.rating.metaDescription,
    },
    privacy: privacy.meta,
  };
}

async function defaultSeo(): Promise<SeoSettings> {
  const [ka, en, ru] = await Promise.all(locales.map(defaultTexts));
  const page = (key: SeoPageKey) => ({ ka: ka[key], en: en[key], ru: ru[key] });
  return {
    siteUrl: "https://temutaxi.ge",
    siteName: "TemuTaxi",
    ogImage: "",
    googleVerification: "",
    bingVerification: "",
    yandexVerification: "",
    indexing: true,
    hiddenPages: [],
    pages: {
      home: page("home"),
      tariffs: page("tariffs"),
      register: page("register"),
      rating: page("rating"),
      privacy: page("privacy"),
    },
  };
}

export async function getSeo(): Promise<SeoSettings> {
  "use cache";
  cacheTag(SEO_TAG);
  cacheLife("minutes");

  try {
    const db = await getDb();
    const stored = await db
      .getRepository(SiteSettingsEntity)
      .findOneBy({ id: 1 });
    if (stored?.seo) return stored.seo;
  } catch (error) {
    console.error("SEO settings could not be read from the database", error);
  }
  return defaultSeo();
}

export async function saveSeo(seo: SeoSettings) {
  const db = await getDb();
  await db.getRepository(SiteSettingsEntity).update(1, { seo });
}

export async function siteMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  return {
    metadataBase: new URL(seo.siteUrl),
    applicationName: seo.siteName,
    robots: seo.indexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
    verification: {
      google: seo.googleVerification || undefined,
      yandex: seo.yandexVerification || undefined,
      other: seo.bingVerification
        ? { "msvalidate.01": seo.bingVerification }
        : undefined,
    },
  };
}

export async function pageMetadata(
  lang: Locale,
  page: SeoPageKey,
): Promise<Metadata> {
  const seo = await getSeo();
  const { title, description } = seo.pages[page][lang];
  const address = (l: Locale) => `/${l}${SEO_PAGE_PATHS[page]}`;
  const image = seo.ogImage || `/og-${lang}.png`;

  return {
    metadataBase: new URL(seo.siteUrl),
    title,
    description,
    alternates: {
      canonical: address(lang),
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, address(l)])),
        "x-default": address(defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: address(lang),
      siteName: seo.siteName,
      locale: OG_LOCALES[lang],
      alternateLocale: locales
        .filter((l) => l !== lang)
        .map((l) => OG_LOCALES[l]),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots:
      seo.indexing && !seo.hiddenPages.includes(page)
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}
