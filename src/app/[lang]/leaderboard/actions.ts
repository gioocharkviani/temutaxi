"use server";

import { isPhoneQuery, searchableLength, MIN_SEARCH_LENGTH } from "@/lib/rating/ranking";
import { getRatingSettings, searchPublicRating, type PublicRow } from "@/lib/rating/service";

export type SearchResult =
  | { status: "short" }
  | { status: "phoneShort" }
  | { status: "unavailable" }
  | { status: "ok"; rows: PublicRow[]; limited: number | null; pageCount: number };

/** The leaderboard search, called while a driver types. Returns only what the public page shows. */
export async function searchLeaderboard(input: string): Promise<SearchResult> {
  const query = String(input ?? "").trim().slice(0, 60);
  const phone = isPhoneQuery(query);
  if (phone === "partial") return { status: "phoneShort" };
  if (!phone && searchableLength(query) < MIN_SEARCH_LENGTH) return { status: "short" };

  const settings = await getRatingSettings().catch(() => null);
  if (!settings?.enabled) return { status: "unavailable" };

  const found = await searchPublicRating(settings, query).catch((error) => {
    console.error("Leaderboard search failed", error);
    return null;
  });
  if (!found) return { status: "unavailable" };
  return { status: "ok", rows: found.rows, limited: found.limited, pageCount: settings.pageCount };
}
