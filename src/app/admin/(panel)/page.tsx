import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatTime, PageLoading, PageTitle } from "@/components/admin/parts";
import { adminCard, secondaryButton } from "@/components/admin/styles";
import type { RegistrationStatus } from "@/db/entities";
import { requireAdmin } from "@/lib/admin/auth";
import { getRecentRegistrations, getTopReferrers } from "@/lib/registrations";
import { deleteRegistrationAction } from "../actions";

export default function RegistrationsPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Registrations searchParams={searchParams} />
    </Suspense>
  );
}

const REGISTRATION_STATUS: Record<RegistrationStatus, [string, string]> = {
  received: ["მიღებულია", "bg-brand-soft text-ink"],
  sent: ["Yandex-ში შეიქმნა", "bg-up-soft text-up"],
  failed: ["Yandex-მა უარი თქვა", "bg-danger-soft text-danger"],
};

const tab = (active: boolean) =>
  `inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition ${active ? "bg-ink text-surface" : "border border-line hover:border-ink-2"}`;

async function Registrations({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  await connection();
  await requireAdmin();
  const onlyReferrals = (await searchParams).ref === "1";
  const [registrations, referrers] = await Promise.all([getRecentRegistrations(50, onlyReferrals), getTopReferrers()]);

  return (
    <>
      <PageTitle title="რეგისტრაციები" hint="ბოლო 50 განაცხადი. ინახება ბაზაში მაშინაც, თუ Yandex-მა უარი თქვა. მომწვევის ნომერი მხოლოდ აქ ინახება და Yandex-ს არ გადაეცემა." />

      <div className="flex flex-wrap gap-2">
        <Link href="/admin" className={tab(!onlyReferrals)}>ყველა</Link>
        <Link href="/admin?ref=1" className={tab(onlyReferrals)}>მხოლოდ რეფერალით</Link>
      </div>

      <div className={`${adminCard} overflow-x-auto`}>
        {registrations.length === 0 ? (
          <p className="text-sm text-muted">{onlyReferrals ? "რეფერალით განაცხადი ჯერ არ არის." : "ჯერ განაცხადი არ არის."}</p>
        ) : (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">თარიღი</th>
                <th className="pb-2 font-medium">მძღოლი</th>
                <th className="pb-2 font-medium">რეფერალი</th>
                <th className="pb-2 font-medium">მოწმობა</th>
                <th className="pb-2 font-medium">მანქანა</th>
                <th className="pb-2 font-medium">სტატუსი</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className={`border-t border-line-soft align-top ${r.referrerPhone ? "bg-brand-tint/60" : ""}`}>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-xs">{formatTime(r.createdAt)}</td>
                  <td className="py-2.5 pr-3">
                    {r.fullName}
                    <span className="block text-xs text-muted">{r.phone}{r.city ? ` · ${r.city}` : ""}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs">
                    {r.referrerPhone ? (
                      <>
                        <span className="whitespace-nowrap rounded-full bg-brand px-2 py-0.5 font-semibold text-ink">რეფერალით</span>
                        <span className="mt-1 block whitespace-nowrap text-ink-2">{r.referrerPhone}</span>
                      </>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-xs">
                    {r.licenseNumber}
                    <span className="block text-muted">{r.licenseIssueDate} — {r.licenseExpiryDate}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs">
                    {[r.carMake, r.carModel, r.carYear].filter(Boolean).join(" ") || "—"}
                    <span className="block text-muted">{[r.carColor, r.carNumber, r.vinCode, r.tariff].filter(Boolean).join(" · ")}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-semibold ${REGISTRATION_STATUS[r.status][1]}`}>{REGISTRATION_STATUS[r.status][0]}</span>
                    {r.error && <span className="mt-1 block text-danger">{r.error}</span>}
                  </td>
                  <td className="py-2.5 text-right">
                    <form action={deleteRegistrationAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className={secondaryButton}>წაშლა</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className={`${adminCard} space-y-3`}>
        <div>
          <h2 className="text-lg font-bold">მომწვევები</h2>
          <p className="mt-1 text-sm text-muted">
            ვინ რამდენი მძღოლი მოიწვია. რეფერალური ბმული: <code className="rounded bg-surface-2 px-1.5 py-0.5">temutaxi.ge/register?ref=599123456</code>, ის მომწვევის ნომერს ფორმაში თავისით ჩაწერს.
          </p>
        </div>
        {referrers.length === 0 ? (
          <p className="text-sm text-muted">ჯერ არცერთი.</p>
        ) : (
          <table className="w-full max-w-xl text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">მომწვევის ნომერი</th>
                <th className="pb-2 font-medium">განაცხადი</th>
                <th className="pb-2 font-medium">Yandex-ში შეიქმნა</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((r) => (
                <tr key={r.phone} className="border-t border-line-soft">
                  <td className="py-2 pr-3 font-semibold">{r.phone}</td>
                  <td className="py-2 pr-3 tabular-nums">{r.count}</td>
                  <td className="py-2 tabular-nums">{r.sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
