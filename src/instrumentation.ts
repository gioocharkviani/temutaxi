/** Called once when the server starts. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  const { startRatingSchedule } = await import("./lib/rating/schedule-runner");
  startRatingSchedule();
}
