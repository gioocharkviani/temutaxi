// When the stored rating should be updated. No database or network here.

import type { RatingSettings } from "@/db/entities";
import { getPeriodRange } from "./period";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Georgia is UTC+4 all year.
const TBILISI_OFFSET_MS = 4 * HOUR_MS;
/** After a failed update, wait this long before trying again on schedule. */
const RETRY_AFTER_FAILURE_MS = 15 * 60 * 1000;

type PeriodSettings = Pick<RatingSettings, "periodMode" | "rollingDays" | "periodStart" | "periodEnd">;

/** Identifies the period the stored rows were counted for, so rows from another period are never shown. */
export const periodKey = (s: PeriodSettings) =>
  s.periodMode === "fixed" ? `fixed:${s.periodStart}:${s.periodEnd}` : `rolling:${s.rollingDays}`;

/** The most recent scheduled time: the start of this hour, or the last midnight in Georgia. */
export function lastScheduledTime(schedule: RatingSettings["syncSchedule"], now: Date) {
  const time = now.getTime();
  if (schedule === "hourly") return new Date(Math.floor(time / HOUR_MS) * HOUR_MS);
  return new Date(Math.floor((time + TBILISI_OFFSET_MS) / DAY_MS) * DAY_MS - TBILISI_OFFSET_MS);
}

export function nextScheduledTime(schedule: RatingSettings["syncSchedule"], now: Date) {
  return new Date(lastScheduledTime(schedule, now).getTime() + (schedule === "hourly" ? HOUR_MS : DAY_MS));
}

type DueSettings = PeriodSettings & Pick<RatingSettings, "enabled" | "syncSchedule" | "lastSyncAt" | "syncPeriodKey" | "syncTo">;

export function isSyncDue(settings: DueSettings, lastJob: { status: string; startedAt: Date } | null, now: Date) {
  if (!settings.enabled) return false;
  if (lastJob?.status === "failed" && now.getTime() - lastJob.startedAt.getTime() < RETRY_AFTER_FAILURE_MS) return false;
  if (settings.syncPeriodKey !== periodKey(settings) || !settings.lastSyncAt) return true;
  // A fixed period has just ended: count it to the end right away, so the final results are saved without waiting for the schedule.
  if (settings.periodMode === "fixed") {
    const end = getPeriodRange(settings, now).to;
    if (end <= now && (!settings.syncTo || settings.syncTo < end)) return true;
  }
  return settings.lastSyncAt < lastScheduledTime(settings.syncSchedule, now);
}
