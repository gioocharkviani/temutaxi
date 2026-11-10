import { connection } from "next/server";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivePromotions } from "@/lib/promotions";
import { PromoBar } from "./PromoBar";
import { PromoModal } from "./PromoModal";
import { PromoBannerView } from "./PromoView";

/** The top bar and the pop-up, on every public page. Renders nothing when none is active. */
export async function SitePromotions({ lang }: { lang: Locale }) {
  await connection();
  const [promotions, dict] = await Promise.all([getActivePromotions(lang), getDictionary(lang)]);
  const bar = promotions.find((p) => p.type === "bar");
  const modal = promotions.find((p) => p.type === "modal");

  return (
    <>
      {bar && <PromoBar key={bar.version} promotion={bar} closeLabel={dict.promo.close} apps={dict.apps} />}
      {modal && <PromoModal key={modal.version} promotion={modal} closeLabel={dict.promo.close} apps={dict.apps} />}
    </>
  );
}

/** Banners on the landing page, under the hero. */
export async function LandingPromotions({ lang }: { lang: Locale }) {
  await connection();
  const [all, dict] = await Promise.all([getActivePromotions(lang), getDictionary(lang)]);
  const banners = all.filter((p) => p.type === "banner");
  if (banners.length === 0) return null;

  return (
    <section aria-label="Promotions" className="mx-auto max-w-site space-y-4 px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
      {banners.map((p) => (
        <PromoBannerView key={p.version} p={p} apps={dict.apps} />
      ))}
    </section>
  );
}
