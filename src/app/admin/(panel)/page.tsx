import { connection } from "next/server";
import { Suspense } from "react";
import { formatTime, PageLoading, PageTitle } from "@/components/admin/parts";
import { adminCard, secondaryButton } from "@/components/admin/styles";
import type { RegistrationStatus } from "@/db/entities";
import { requireAdmin } from "@/lib/admin/auth";
import { getRecentRegistrations } from "@/lib/registrations";
import { deleteRegistrationAction } from "../actions";

export default function RegistrationsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Registrations />
    </Suspense>
  );
}

const REGISTRATION_STATUS: Record<RegistrationStatus, [string, string]> = {
  received: ["მიღებულია", "bg-brand-soft text-ink"],
  sent: ["Yandex-ში შეიქმნა", "bg-up-soft text-up"],
  failed: ["Yandex-მა უარი თქვა", "bg-danger-soft text-danger"],
};

async function Registrations() {
  await connection();
  await requireAdmin();
  const registrations = await getRecentRegistrations();

  return (
    <>
      <PageTitle title="რეგისტრაციები" hint="ბოლო 50 განაცხადი. ინახება ბაზაში მაშინაც, თუ Yandex-მა უარი თქვა." />
      <div className={`${adminCard} overflow-x-auto`}>
        {registrations.length === 0 ? (
          <p className="text-sm text-muted">ჯერ განაცხადი არ არის.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">თარიღი</th>
                <th className="pb-2 font-medium">მძღოლი</th>
                <th className="pb-2 font-medium">მოწმობა</th>
                <th className="pb-2 font-medium">მანქანა</th>
                <th className="pb-2 font-medium">სტატუსი</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-t border-line-soft align-top">
                  <td className="whitespace-nowrap py-2.5 pr-3 text-xs">{formatTime(r.createdAt)}</td>
                  <td className="py-2.5 pr-3">
                    {r.fullName}
                    <span className="block text-xs text-muted">{r.phone}{r.city ? ` · ${r.city}` : ""}</span>
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
    </>
  );
}
