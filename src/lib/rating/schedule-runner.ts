// Runs inside the Next.js server process. Checks once a minute whether the rating update is due.

import { runRatingSyncIfDue } from "../jobs";

const CHECK_EVERY_MS = 60_000;
const FIRST_CHECK_MS = 5_000;

// Kept on globalThis so hot reloading in development does not start a second timer.
const store = globalThis as unknown as { temutaxiRatingTimer?: boolean };

export function startRatingSchedule() {
  if (store.temutaxiRatingTimer) return;
  store.temutaxiRatingTimer = true;

  const check = () => runRatingSyncIfDue("განრიგი").catch((error) => console.error("Rating schedule check failed", error));
  setTimeout(check, FIRST_CHECK_MS).unref();
  setInterval(check, CHECK_EVERY_MS).unref();
}
