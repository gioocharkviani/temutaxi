const day = new Intl.DateTimeFormat("ka-GE", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Tbilisi" });

/** "1 ნოე. 2026 — 30 ნოე. 2026": the end is stored as the start of the next day. */
export const archiveRange = (from: Date, to: Date) => `${day.format(from)} — ${day.format(new Date(to.getTime() - 1))}`;
