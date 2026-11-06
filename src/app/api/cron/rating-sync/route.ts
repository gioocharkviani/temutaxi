import { timingSafeEqual } from "node:crypto";
import { runRatingSyncIfDue } from "@/lib/jobs";

// For hosting where no server keeps running (for example Vercel): an outside scheduler calls this every hour
// with the header "Authorization: Bearer <CRON_SECRET>". It only updates when the schedule in the admin panel says so.
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ updated: await runRatingSyncIfDue("cron") });
}
