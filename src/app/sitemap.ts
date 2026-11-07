import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { locales } from "@/i18n/config";
import { getRatingSettings } from "@/lib/rating/service";
import { getSeo, SEO_PAGE_PATHS } from "@/lib/seo";
import type { SeoPageKey } from "@/db/entities";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const seo = await getSeo();
  if (!seo.indexing) return [];

  const rating = await getRatingSettings().catch(() => null);
  const pages = (Object.keys(SEO_PAGE_PATHS) as SeoPageKey[]).filter(
    (page) =>
      !seo.hiddenPages.includes(page) && (page !== "rating" || rating?.enabled),
  );

  return pages.flatMap((page) => {
    const address = (lang: string) =>
      `${seo.siteUrl}/${lang}${SEO_PAGE_PATHS[page]}`;
    return locales.map((lang) => ({
      url: address(lang),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, address(l)])),
      },
    }));
  });
}
