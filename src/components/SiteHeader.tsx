import { connection } from "next/server";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getRatingSettings } from "@/lib/rating/service";
import { Header } from "./Header";

type Props = { lang: Locale; nav: Dictionary["nav"] };

/** The header, with the rating link only while the rating is turned on. */
export function SiteHeader(props: Props) {
  return (
    <Suspense fallback={<Header {...props} showRating={false} />}>
      <HeaderWithRating {...props} />
    </Suspense>
  );
}

async function HeaderWithRating(props: Props) {
  await connection();
  const settings = await getRatingSettings().catch(() => null);
  return <Header {...props} showRating={Boolean(settings?.enabled)} />;
}
