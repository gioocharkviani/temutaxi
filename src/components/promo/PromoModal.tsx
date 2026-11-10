"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PublicPromotion } from "@/lib/promotions";
import { CloseButton, PromoModalCard } from "./PromoView";

const SHOW_AFTER_MS = 1200;

// "session": once per browser tab session (sessionStorage).
// "hours": once, then again after the chosen hours, even after the browser is closed (localStorage with a time).
function alreadySeen(p: PublicPromotion) {
  const key = `temutaxi-promo-${p.version}`;
  try {
    if (p.repeat === "session") return sessionStorage.getItem(key) === "1";
    const until = Number(localStorage.getItem(key));
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    // Storage can be blocked; then the modal shows once on this page view and nothing is remembered.
    return false;
  }
}

function rememberSeen(p: PublicPromotion) {
  const key = `temutaxi-promo-${p.version}`;
  try {
    if (p.repeat === "session") sessionStorage.setItem(key, "1");
    else localStorage.setItem(key, String(Date.now() + p.repeatHours * 60 * 60 * 1000));
  } catch {
    // See alreadySeen.
  }
}

export function PromoModal({ promotion, closeLabel }: { promotion: PublicPromotion; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  // Shown a moment after the page appears, and remembered as soon as it is shown.
  useEffect(() => {
    if (alreadySeen(promotion)) return;
    const timer = setTimeout(() => {
      rememberSeen(promotion);
      previousFocus.current = document.activeElement;
      setOpen(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [promotion]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      (previousFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="promo-modal-in fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 outline-none backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <PromoModalCard
        p={promotion}
        titleId={titleId}
        onButton={() => setOpen(false)}
        close={<CloseButton label={closeLabel} color={promotion.colors.text} onClick={() => setOpen(false)} />}
      />
    </div>
  );
}
