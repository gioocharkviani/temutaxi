// Talks to the Yandex Fleet API. Server only, because it uses the secret keys from .env.

import "server-only";
import { toE164, type RegistrationValues } from "./registration";

const LICENCE_COUNTRY = "geo";
const TIMEOUT_MS = 15_000;

export type FleetResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured" | "rejected" | "unreachable"; detail?: string };

function readConfig() {
  const { BASE_URL, API_KEY, CLIENT_ID, PARK_ID } = process.env;
  if (!BASE_URL || !API_KEY || !CLIENT_ID || !PARK_ID) {
    console.error("Set BASE_URL, API_KEY, CLIENT_ID and PARK_ID in .env");
    return null;
  }
  return {
    baseUrl: BASE_URL.replace(/\/+$/, ""),
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    parkId: PARK_ID,
  };
}

export class FleetApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type FleetOrder = {
  id: string;
  ended_at?: string | null;
  category?: string | null;
  driver_profile?: { id?: string; name?: string } | null;
};

const ORDERS_PAGE_SIZE = 500;
const MAX_ORDER_PAGES = 2000;
const RATE_LIMIT_RETRIES = 3;

/** POST /v1/parks/orders/list: every completed order that ended in the period, across all pages. */
export async function listCompletedOrders(from: Date, to: Date): Promise<FleetOrder[]> {
  const config = readConfig();
  if (!config) throw new Error("Yandex API settings are missing from .env");

  const orders: FleetOrder[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_ORDER_PAGES; page++) {
    const data = await requestOrdersPage(config, from, to, cursor);
    orders.push(...(data.orders ?? []));
    cursor = data.cursor || undefined;
    if (!cursor) return orders;
  }
  throw new Error(`Stopped after ${MAX_ORDER_PAGES} pages of orders`);
}

async function requestOrdersPage(config: Config, from: Date, to: Date, cursor?: string) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${config.baseUrl}/v1/parks/orders/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en",
        "X-API-Key": config.apiKey,
        "X-Client-ID": config.clientId,
      },
      body: JSON.stringify({
        limit: ORDERS_PAGE_SIZE,
        ...(cursor ? { cursor } : {}),
        query: {
          park: {
            id: config.parkId,
            order: {
              ended_at: { from: from.toISOString(), to: to.toISOString() },
              statuses: ["complete"],
            },
          },
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS * 2),
    });

    if (response.status === 429 && attempt < RATE_LIMIT_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      continue;
    }

    const data: { orders?: FleetOrder[]; cursor?: string; message?: string } = await response
      .json()
      .catch(() => ({}));
    if (!response.ok) throw new FleetApiError(response.status, data.message ?? "Unknown error");
    return data;
  }
}

type Config = NonNullable<ReturnType<typeof readConfig>>;

const PROFILES_PAGE_SIZE = 1000;
const MAX_PROFILE_PAGES = 200;

/**
 * POST /v1/parks/driver-profiles/list: each driver's phone numbers, by driver id.
 * The API key needs permission to read drivers; without it Yandex answers 403.
 */
export async function listDriverPhones(): Promise<Map<string, string[]>> {
  const config = readConfig();
  if (!config) throw new Error("Yandex API settings are missing from .env");

  const phones = new Map<string, string[]>();
  for (let page = 0, offset = 0; page < MAX_PROFILE_PAGES; page++, offset += PROFILES_PAGE_SIZE) {
    const data = await requestProfilesPage(config, offset);
    for (const item of data.driver_profiles ?? []) {
      const id = item.driver_profile?.id;
      const list = (item.driver_profile?.phones ?? []).filter(Boolean);
      if (id && list.length) phones.set(id, list);
    }
    if (!data.driver_profiles?.length || offset + PROFILES_PAGE_SIZE >= (data.total ?? 0)) return phones;
  }
  return phones;
}

type ProfilesPage = { driver_profiles?: { driver_profile?: { id?: string; phones?: string[] } }[]; total?: number; message?: string };

async function requestProfilesPage(config: Config, offset: number): Promise<ProfilesPage> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${config.baseUrl}/v1/parks/driver-profiles/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": "en", "X-API-Key": config.apiKey, "X-Client-ID": config.clientId },
      body: JSON.stringify({
        limit: PROFILES_PAGE_SIZE,
        offset,
        fields: { driver_profile: ["id", "phones"] },
        query: { park: { id: config.parkId } },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS * 2),
    });
    if (response.status === 429 && attempt < RATE_LIMIT_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      continue;
    }
    const data: ProfilesPage = await response.json().catch(() => ({}));
    if (!response.ok) throw new FleetApiError(response.status, data.message ?? "Unknown error");
    return data;
  }
}
type WorkRule = { id: string; name: string; is_enabled: boolean };

/** GET /v1/parks/driver-work-rules: the park's work rules; null when the request fails. */
async function getWorkRules(config: Config): Promise<WorkRule[] | null> {
  const response = await fetch(
    `${config.baseUrl}/v1/parks/driver-work-rules?park_id=${encodeURIComponent(config.parkId)}`,
    {
      headers: {
        "Accept-Language": "ka",
        "X-API-Key": config.apiKey,
        "X-Client-ID": config.clientId,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  ).catch(() => null);

  if (!response?.ok) {
    console.error("Fleet API work rules request failed", response?.status);
    return null;
  }
  const data: { rules?: WorkRule[] } = await response.json().catch(() => ({}));
  return data.rules ?? null;
}

function pickWorkRule(rules: WorkRule[]) {
  const enabled = rules.filter((r) => r.is_enabled);
  const configured = process.env.WORK_RULE_ID;
  if (configured) return enabled.find((r) => r.id === configured)?.id ?? null;
  return enabled.length === 1 ? enabled[0].id : null;
}

/** DD.MM.YYYY (form) to YYYY-MM-DD (API). */
const toIsoDate = (value: string) => value.split(".").reverse().join("-");


/** Today in Georgia, whatever time zone the server runs in. */
const todayInTbilisi = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi" }).format(new Date());

/** The API has no fields for these until a car is created, so the manager reads them from the comment. */
function carComment(v: RegistrationValues, tariff: string) {
  const car = [v["car-make"], v["car-model"], v["car-year"]].filter(Boolean).join(" ");
  return [
    car && `Car: ${car}`,
    v["car-color"] && `Colour: ${v["car-color"]}`,
    v["car-number"] && `Plate: ${v["car-number"]}`,
    v["vin-code"] && `VIN: ${v["vin-code"]}`,
    tariff && `Tariff: ${tariff}`,
    v.city && `City: ${v.city}`,
  ]
    .filter(Boolean)
    .join("; ");
}

function buildDriverProfile(v: RegistrationValues, tariff: string, workRuleId: string, balanceLimit: string) {
  const [firstName, ...rest] = v["user-name"].trim().split(/\s+/);
  const comment = carComment(v, tariff);

  return {
    // The docs mark `account` optional, but the API answers "Error at path 'account': Field is missing".
    account: {
      work_rule_id: workRuleId,
      balance_limit: balanceLimit,
      block_orders_on_balance_below_limit: true,
    },
    person: {
      full_name: { first_name: firstName, last_name: rest.join(" ") },
      contact_info: { phone: toE164(v["user-phone"]) },
      driver_license: {
        country: LICENCE_COUNTRY,
        number: v["license-series"],
        issue_date: toIsoDate(v["issue-date"]),
        expiry_date: toIsoDate(v["expiration-date"]),
      },
    },
    profile: { hire_date: todayInTbilisi(), ...(comment ? { comment } : {}) },
    order_provider: { platform: true, partner: true },
  };
}

/** POST /v2/parks/contractors/driver-profile: creates the driver in the park. */
export async function createDriverProfile(
  v: RegistrationValues,
  tariff: string,
  idempotencyToken: string,
): Promise<FleetResult> {
  const config = readConfig();
  const balanceLimit = process.env.BALANCE_LIMIT;
  if (!config || !balanceLimit) {
    if (!balanceLimit) console.error("Set BALANCE_LIMIT in .env");
    return { ok: false, reason: "not-configured" };
  }

  const rules = await getWorkRules(config);
  if (!rules) return { ok: false, reason: "unreachable" };

  const workRuleId = pickWorkRule(rules);
  if (!workRuleId) {
    const enabled = rules.filter((r) => r.is_enabled).map((r) => `${r.id} (${r.name})`);
    console.error("Set WORK_RULE_ID to an enabled work rule:", enabled);
    return { ok: false, reason: "not-configured" };
  }

  const response = await fetch(`${config.baseUrl}/v2/parks/contractors/driver-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
      "X-Client-ID": config.clientId,
      "X-Park-ID": config.parkId,
      "X-Idempotency-Token": idempotencyToken,
    },
    body: JSON.stringify(buildDriverProfile(v, tariff, workRuleId, balanceLimit)),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch(() => null);

  if (!response) return { ok: false, reason: "unreachable" };

  const data: { contractor_profile_id?: string; code?: string; message?: string } = await response
    .json()
    .catch(() => ({}));

  if (!response.ok || !data.contractor_profile_id) {
    console.error("Fleet API refused a driver profile", response.status, data.code, data.message);
    return { ok: false, reason: "rejected", detail: `${response.status} ${data.code ?? ""} ${data.message ?? ""}`.trim() };
  }
  return { ok: true, id: data.contractor_profile_id };
}
