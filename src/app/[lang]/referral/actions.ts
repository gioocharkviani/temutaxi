"use server";

import { headers } from "next/headers";
import QRCode from "qrcode";
import { hasLocale } from "@/i18n/config";
import { checkParkDriver } from "@/lib/park-drivers";
import { getSeo } from "@/lib/seo";

export type ReferralResult =
  | { status: "ok"; link: string; qr: string; verified: boolean }
  | { status: "invalid" | "notDriver" | "tooMany" | "error" };

// Limits how many numbers one visitor can check, so the page cannot be used to list the park's drivers.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const store = globalThis as unknown as { temutaxiReferralTries?: Map<string, number[]> };
const tries = (store.temutaxiReferralTries ??= new Map<string, number[]>());

function allowed(ip: string) {
  const now = Date.now();
  const recent = (tries.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  tries.set(ip, recent);
  if (tries.size > 5000) tries.clear();
  return true;
}

/** Builds a driver's referral link and QR code, after checking the number belongs to a park driver when we can. */
export async function generateReferral(phone: string, lang: string): Promise<ReferralResult> {
  const digits = String(phone ?? "").replace(/\D/g, "");
  const local = digits.startsWith("995") ? digits.slice(3) : digits;
  if (!/^5\d{8}$/.test(local) || !hasLocale(lang)) return { status: "invalid" };

  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allowed(ip)) return { status: "tooMany" };

  try {
    const park = await checkParkDriver(local);
    if (park === "no") return { status: "notDriver" };

    const { siteUrl } = await getSeo();
    const link = `${siteUrl}/${lang}/register?ref=${local}`;
    const qr = await QRCode.toDataURL(link, { width: 640, margin: 2, errorCorrectionLevel: "M", color: { dark: "#21201f", light: "#ffffff" } });
    return { status: "ok", link, qr, verified: park === "yes" };
  } catch (error) {
    console.error("Referral link failed", error);
    return { status: "error" };
  }
}
