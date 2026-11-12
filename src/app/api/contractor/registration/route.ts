import { after } from "next/server";
import { getCars } from "@/lib/cars";
import { sendRegistrationEmail } from "@/lib/mail";
import { createDriverProfile } from "@/lib/fleet";
import { classifyFleetError, showsYandexText } from "@/lib/fleet-errors";
import { effectiveTariff, getTariffState } from "@/lib/registration";
import {
  parseRegistration,
  validateRegistration,
} from "@/lib/registration-schema";
import {
  markRegistrationFailed,
  markRegistrationSent,
  saveRegistration,
} from "@/lib/registrations";

/** The API accepts 16-64 printable ASCII characters. */
const VALID_TOKEN = /^[\x20-\x7e]{16,64}$/;

const STATUS = {
  "not-configured": 503,
  rejected: 502,
  unreachable: 502,
} as const;

export async function POST(request: Request) {
  // 1. Is this the right shape of data?
  const body: unknown = await request.json().catch(() => null);
  const values = parseRegistration(body);
  if (!values) return Response.json({ error: "invalid" }, { status: 400 });

  // 2. Does it follow the rules? Tariffs are checked against the car list in the database.
  const cars = await getCars();
  const errors = validateRegistration(values, cars);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "invalid", errors }, { status: 422 });
  }

  // 3. Save it. The form keeps one id across retries, so a repeat cannot create a second driver.
  const requestId = (body as { requestId?: unknown }).requestId;
  const token =
    typeof requestId === "string" && VALID_TOKEN.test(requestId)
      ? requestId
      : crypto.randomUUID();
  const tariff = effectiveTariff(values, getTariffState(values, cars));

  const saved = await saveRegistration(values, tariff, token).catch((error) => {
    console.error("Registration could not be saved", error);
    return null;
  });
  if (!saved) return Response.json({ error: "not-saved" }, { status: 503 });
  if (saved.alreadySent) return Response.json({ ok: true });

  // 4. Create the driver in Yandex.
  // A retry after Yandex refused the application gets a fresh token, or Yandex could repeat its old answer.
  const yandexToken = saved.refusedBefore
    ? `${token.slice(0, 40)}-${Date.now().toString(36)}`
    : token;
  const result = await createDriverProfile(values, tariff, yandexToken);
  // Admins hear about every application, also the ones Yandex refused.
  after(() => sendRegistrationEmail(saved.id));
  if (!result.ok) {
    await markRegistrationFailed(saved.id, result.detail ?? result.reason);
    if (result.reason === "rejected") {
      return Response.json(
        {
          error: "rejected",
          kind: classifyFleetError(result.status, result.code, result.message),
          yandex: showsYandexText(result.status)
            ? {
                code: result.code.slice(0, 100),
                message: result.message.slice(0, 300),
              }
            : null,
        },
        { status: STATUS.rejected },
      );
    }
    return Response.json(
      { error: result.reason },
      { status: STATUS[result.reason] },
    );
  }
  await markRegistrationSent(saved.id, result.id);
  return Response.json({ ok: true });
}
