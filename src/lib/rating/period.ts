import type { RatingSettings } from "@/db/entities";

// Georgia is UTC+4 all year, with no daylight saving.
const TBILISI_OFFSET = "+04:00";
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: string) => new Date(`${date}T00:00:00${TBILISI_OFFSET}`);

/** The scoring period: `from` is included, `to` is excluded. */
export function getPeriodRange(
  settings: Pick<RatingSettings, "periodMode" | "rollingDays" | "periodStart" | "periodEnd">,
  now = new Date(),
) {
  if (settings.periodMode === "fixed" && settings.periodStart && settings.periodEnd) {
    return {
      from: startOfDay(settings.periodStart),
      to: new Date(startOfDay(settings.periodEnd).getTime() + DAY_MS),
    };
  }
  return { from: new Date(now.getTime() - settings.rollingDays * DAY_MS), to: now };
}
