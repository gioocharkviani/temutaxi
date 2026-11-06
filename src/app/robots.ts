import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSeo } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const seo = await getSeo();
  return {
    // A hidden site stays crawlable on purpose: Google must be able to read its noindex to drop it from results.
    // "?q=" is the rating search: its results contain driver names and should not become search pages.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/*?q="] },
    sitemap: `${seo.siteUrl}/sitemap.xml`,
  };
}
