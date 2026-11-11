import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { archiveRange } from "@/components/admin/archive-format";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Block, formatTime, PageLoading, PageTitle } from "@/components/admin/parts";
import { adminCard, secondaryButton } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { getArchivedPeriod } from "@/lib/rating/archive";
import { RATING_CATEGORIES } from "@/lib/rating/settings-schema";
import { deleteArchivedPeriodAction } from "../../../../actions";

export default function ArchivedPeriodPage({ params }: PageProps<"/admin/rating/archive/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ArchivedPeriod params={params} />
    </Suspense>
  );
}

async function ArchivedPeriod({ params }: { params: PageProps<"/admin/rating/archive/[id]">["params"] }) {
  await connection();
  await requireAdmin();
  const id = Number((await params).id);
  const archive = Number.isInteger(id) && id > 0 ? await getArchivedPeriod(id) : null;
  if (!archive) notFound();
  const { period, results } = archive;
  const categories = period.rules.categories.map((code) => RATING_CATEGORIES.find((c) => c.code === code)?.label ?? code).join(", ");

  return (
    <>
      <Link href="/admin/rating#archive" className="text-sm font-semibold text-muted hover:text-ink">← ლიდერბორდი</Link>
      <PageTitle title={`შედეგები: ${archiveRange(period.periodFrom, period.periodTo)}`} hint={`შენახულია ${formatTime(period.savedAt)}`} />

      <section className={`${adminCard} grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4`}>
        <p><span className="text-muted">მძღოლი: </span><strong>{period.drivers}</strong></p>
        <p><span className="text-muted">შეკვეთა ჯამში: </span><strong>{period.totalOrders}</strong></p>
        <p><span className="text-muted">მინ. შეკვეთა: </span><strong>{period.rules.minOrders}</strong></p>
        <p><span className="text-muted">ფრე: </span><strong>{period.rules.tieBreak === "last" ? "ბოლოს მიღწეული წინ" : "პირველად მიღწეული წინ"}</strong></p>
        <p className="sm:col-span-2 lg:col-span-4"><span className="text-muted">ტარიფები: </span>{categories}</p>
      </section>

      <Block title="საბოლოო ცხრილი" hint="დამალული მძღოლები აქ არ შედის. პრიზი ნაჩვენებია იმ პარამეტრებით, რაც პერიოდის ბოლოს იყო.">
        <div className={`${adminCard} overflow-x-auto`}>
          {results.length === 0 ? (
            <p className="text-sm text-muted">ამ პერიოდში პირობის შესაბამისი მძღოლი არ ყოფილა.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="pb-2 font-medium">ადგილი</th>
                  <th className="pb-2 font-medium">სახელი</th>
                  <th className="pb-2 font-medium">შეკვეთა</th>
                  <th className="pb-2 font-medium">პრიზი</th>
                  <th className="pb-2 font-medium">ბოლო შეკვეთა</th>
                  <th className="pb-2 font-medium">Yandex ID</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-t border-line-soft">
                    <td className={`py-2.5 font-semibold tabular-nums ${r.prize !== null ? "text-up" : ""}`}>{r.position}</td>
                    <td className="py-2.5">{r.driverName}</td>
                    <td className="py-2.5 tabular-nums">{r.orders}</td>
                    <td className="py-2.5 tabular-nums">{r.prize !== null ? `${r.prize} ₾` : "—"}</td>
                    <td className="py-2.5 text-xs">{formatTime(r.lastOrderAt)}</td>
                    <td className="py-2.5 font-mono text-xs text-muted">{r.driverId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Block>

      <Block title="წაშლა" hint="თუ ლიდერბორდი ისევ ამ პერიოდზეა, შემდეგი განახლება შედეგებს თავიდან შეინახავს (მაგ. მძღოლის დამალვის შემდეგ).">
        <form action={deleteArchivedPeriodAction}>
          <input type="hidden" name="id" value={period.id} />
          <ConfirmButton message="წავშალო ამ პერიოდის შენახული შედეგები?" className={secondaryButton}>შედეგების წაშლა</ConfirmButton>
        </form>
      </Block>
    </>
  );
}
