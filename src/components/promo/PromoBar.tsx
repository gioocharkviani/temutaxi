"use client";

import { useState, useSyncExternalStore } from "react";
import type { AppLinksText } from "@/components/AppLinks";
import type { PublicPromotion } from "@/lib/promotions";
import { CloseButton, PromoBarView } from "./PromoView";

const noSubscription = () => () => {};

/** The top strip. Closing it hides it for the rest of the browser session. */
export function PromoBar({ promotion, closeLabel, apps }: { promotion: PublicPromotion; closeLabel: string; apps: AppLinksText }) {
  const key = `temutaxi-bar-${promotion.version}`;
  const closedEarlier = useSyncExternalStore(
    noSubscription,
    () => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [closedNow, setClosedNow] = useState(false);
  if (closedEarlier || closedNow) return null;

  const close = () => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked; the bar still closes on this page.
    }
    setClosedNow(true);
  };

  return (
    <aside aria-label={promotion.title}>
      <PromoBarView p={promotion} apps={apps} close={<CloseButton label={closeLabel} color={promotion.colors.text} onClick={close} />} />
    </aside>
  );
}
