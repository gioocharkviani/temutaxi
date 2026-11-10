// E-mail notifications about new applications, sent with nodemailer.
// The SMTP login is in .env (it is a password); the recipients are edited in the admin panel.

import "server-only";
import nodemailer from "nodemailer";
import { getDb } from "@/db/data-source";
import { RegistrationEntity, SiteSettingsEntity, type MailResult, type MailSettings, type Registration } from "@/db/entities";

const DEFAULT_MAIL: MailSettings = { enabled: false, recipients: [] };

function readSmtp() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT) || 587;
  return { host: SMTP_HOST, port, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM || `TemuTaxi <${SMTP_USER}>` };
}

/** What the admin panel may show about the SMTP setup: never the password. */
export function smtpStatus() {
  const smtp = readSmtp();
  return smtp ? { configured: true as const, host: smtp.host, port: smtp.port, user: smtp.user, from: smtp.from } : { configured: false as const };
}

export async function getMailSettings(): Promise<{ settings: MailSettings; last: MailResult | null }> {
  const db = await getDb();
  const row = await db.getRepository(SiteSettingsEntity).findOneBy({ id: 1 });
  return { settings: row?.mail ?? DEFAULT_MAIL, last: row?.mailLast ?? null };
}

export async function saveMailSettings(mail: MailSettings) {
  const db = await getDb();
  await db.getRepository(SiteSettingsEntity).update(1, { mail });
}

async function recordResult(result: MailResult) {
  const db = await getDb();
  await db.getRepository(SiteSettingsEntity).update(1, { mailLast: result });
}

async function send(to: string[], subject: string, text: string, html: string) {
  const smtp = readSmtp();
  if (!smtp) throw new Error("SMTP არ არის მითითებული .env-ში (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
  await transport.sendMail({ from: smtp.from, to, subject, text, html });
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const STATUS: Record<Registration["status"], string> = {
  received: "მიღებულია",
  sent: "Yandex-ში შეიქმნა",
  failed: "Yandex-მა უარი თქვა",
};

function registrationRows(r: Registration): [string, string][] {
  return [
    ["სახელი და გვარი", r.fullName],
    ["ტელეფონი", r.phone],
    ["ქალაქი", r.city ?? ""],
    ["მართვის მოწმობა", `${r.licenseNumber} (${r.licenseIssueDate} — ${r.licenseExpiryDate})`],
    ["მანქანა", [r.carMake, r.carModel, r.carYear].filter(Boolean).join(" ")],
    ["ფერი / ნომერი / VIN", [r.carColor, r.carNumber, r.vinCode].filter(Boolean).join(" · ")],
    ["ტარიფი", r.tariff ?? ""],
    ["რეფერალის ნომერი", r.referrerPhone ?? "არა"],
    ["სტატუსი", STATUS[r.status] + (r.error ? `: ${r.error}` : "")],
  ].filter(([, value]) => value) as [string, string][];
}

/** Sends the new application to every recipient. Never throws: the result is stored for the admin panel. */
export async function sendRegistrationEmail(registrationId: number) {
  try {
    const { settings } = await getMailSettings();
    if (!settings.enabled || settings.recipients.length === 0) return;

    const db = await getDb();
    const r = await db.getRepository(RegistrationEntity).findOneBy({ id: registrationId });
    if (!r) return;

    const rows = registrationRows(r);
    const subject = `ახალი განაცხადი: ${r.fullName}${r.referrerPhone ? " (რეფერალით)" : ""}`;
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    const html = `<h2 style="font-family:sans-serif">ახალი განაცხადი TemuTaxi-ზე</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${escape(k)}</td><td style="padding:4px 0"><b>${escape(v)}</b></td></tr>`)
      .join("")}</table>`;

    await send(settings.recipients, subject, text, html);
    await recordResult({ at: new Date().toISOString(), ok: true, message: `გაიგზავნა: ${settings.recipients.length} მიმღები (განაცხადი #${r.id})` });
  } catch (error) {
    console.error("Registration e-mail failed", error);
    await recordResult({ at: new Date().toISOString(), ok: false, message: error instanceof Error ? error.message : String(error) }).catch(() => {});
  }
}

/** A test message to the given recipients, for the admin panel. Returns the error text, or null on success. */
export async function sendTestEmail(recipients: string[]) {
  try {
    await send(recipients, "TemuTaxi: სატესტო წერილი", "ელფოსტის შეტყობინებები მუშაობს.", "<p style=\"font-family:sans-serif\">ელფოსტის შეტყობინებები მუშაობს.</p>");
    await recordResult({ at: new Date().toISOString(), ok: true, message: `სატესტო წერილი გაიგზავნა: ${recipients.length} მიმღები` });
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await recordResult({ at: new Date().toISOString(), ok: false, message }).catch(() => {});
    return message;
  }
}
