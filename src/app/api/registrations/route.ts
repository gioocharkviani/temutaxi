import { parseRegistration, toPayload, validateRegistration } from "@/lib/registration";

/**
 * Receives the registration form. Set REGISTRATION_WEBHOOK_URL to the endpoint that stores applications.
 * Without it, development runs accept the form and discard it; production refuses, so an applicant
 * is never told "received" when the data went nowhere.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const values = parseRegistration(body);
  if (!values) return Response.json({ error: "invalid" }, { status: 400 });

  const errors = validateRegistration(values);
  if (Object.keys(errors).length > 0) return Response.json({ error: "invalid", errors }, { status: 422 });

  const webhook = process.env.REGISTRATION_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV === "production") return Response.json({ error: "not-configured" }, { status: 503 });
    return Response.json({ ok: true, demo: true });
  }

  const requestId = (body as { requestId?: unknown }).requestId;
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values, typeof requestId === "string" ? requestId.slice(0, 64) : crypto.randomUUID())),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response?.ok) return Response.json({ error: "delivery-failed" }, { status: 502 });
  return Response.json({ ok: true });
}
