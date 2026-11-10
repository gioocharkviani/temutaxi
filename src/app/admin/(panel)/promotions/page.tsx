import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { formatTime, PageLoading, PageTitle } from "@/components/admin/parts";
import { adminCard, primaryButton, secondaryButton } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { PROMOTION_THEMES, PROMOTION_TYPES } from "@/lib/promotion-schema";
import { listPromotions, promotionStatus, type PromotionStatus } from "@/lib/promotions";
import { deletePromotionAction, togglePromotionAction } from "../../actions";

export default function PromotionsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Promotions />
    </Suspense>
  );
}

const STATUS: Record<PromotionStatus, [string, string]> = {
  active: ["ჩანს საიტზე", "bg-up-soft text-up"],
  scheduled: ["დაგეგმილია", "bg-brand-soft text-ink"],
  ended: ["დასრულდა", "bg-surface-2 text-muted"],
  off: ["გამორთულია", "bg-surface-2 text-muted"],
};

async function Promotions() {
  await connection();
  await requireAdmin();
  const promotions = await listPromotions();
  const now = new Date();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle title="პრომოუშენები" hint="მოდალები, მთავარი გვერდის ბანერები და ზედა ზოლი. ცვლილება საიტზე მაშინვე ჩანს." />
        <Link href="/admin/promotions/new" className={primaryButton}>ახალი პრომოუშენი</Link>
      </div>

      <div className={`${adminCard} overflow-x-auto`}>
        {promotions.length === 0 ? (
          <p className="text-sm text-muted">ჯერ პრომოუშენი არ არის.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">სახელი</th>
                <th className="pb-2 font-medium">ტიპი და თემა</th>
                <th className="pb-2 font-medium">სტატუსი</th>
                <th className="pb-2 font-medium">პერიოდი</th>
                <th className="pb-2 font-medium">რიგი</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const [label, style] = STATUS[promotionStatus(p, now)];
                return (
                  <tr key={p.id} className="border-t border-line-soft align-middle">
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <span aria-hidden="true" className="size-4 shrink-0 rounded-full border border-line" style={{ background: p.colors.background }} />
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted">{p.content.ka.title}</span>
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {PROMOTION_TYPES.find((t) => t.id === p.type)?.label}
                      <span className="block text-muted">{PROMOTION_THEMES.find((t) => t.id === p.theme)?.label}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>{label}</span>
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {p.startsAt || p.endsAt ? `${formatTime(p.startsAt)} — ${formatTime(p.endsAt)}` : "უვადო"}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{p.priority}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <form action={togglePromotionAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" className={secondaryButton}>{p.enabled ? "გამორთვა" : "ჩართვა"}</button>
                        </form>
                        <Link href={`/admin/promotions/${p.id}`} className={secondaryButton}>რედაქტირება</Link>
                        <form action={deletePromotionAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton message={`წავშალო „${p.name}“? აღდგენა შეუძლებელია.`} className={secondaryButton}>წაშლა</ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
