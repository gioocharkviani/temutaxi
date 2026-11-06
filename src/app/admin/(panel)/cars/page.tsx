import { connection } from "next/server";
import { Suspense } from "react";
import { JobAutoRefresh } from "@/components/admin/JobAutoRefresh";
import { Block, JOB_NAMES, JobCard, JobsTable, PageLoading, PageTitle } from "@/components/admin/parts";
import { adminCard, primaryButton } from "@/components/admin/styles";
import { getDb } from "@/db/data-source";
import { CarListEntryEntity } from "@/db/entities";
import { requireAdmin } from "@/lib/admin/auth";
import { AUTO_LIST_CITIES } from "@/lib/auto-list";
import { getCarListCity } from "@/lib/cars";
import { getRecentJobs } from "@/lib/jobs";
import { saveCarCityAction, startCarListAction } from "../../actions";

export default function CarsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Cars />
    </Suspense>
  );
}

const CITY_NAMES: Record<(typeof AUTO_LIST_CITIES)[number], string> = {
  tbilisi: "თბილისი",
  batumi: "ბათუმი",
  kutaisi: "ქუთაისი",
  rustavi: "რუსთავი",
};

async function Cars() {
  await connection();
  await requireAdmin();
  const db = await getDb();
  const [jobs, carCount, carCity] = await Promise.all([
    getRecentJobs(12, "car_list_update"),
    db.getRepository(CarListEntryEntity).count(),
    getCarListCity(),
  ]);
  const running = jobs.some((j) => j.status === "running");

  return (
    <>
      <JobAutoRefresh running={running} />
      <PageTitle title="მანქანების სია" hint="Yandex Pro-ს ოფიციალური სია, რომელსაც იყენებს მანქანის შემოწმება, ტარიფები და რეგისტრაცია." />

      <form action={saveCarCityAction} className={`${adminCard} flex flex-wrap items-end gap-3`}>
        <label className="block text-sm font-semibold">
          საიტზე რომელი ქალაქის მანქანების სია გამოიყენოს
          <select name="city" defaultValue={carCity} key={carCity} className="mt-2 block h-11 rounded-xl border border-line bg-surface px-3 text-sm font-normal">
            {AUTO_LIST_CITIES.map((city) => (
              <option key={city} value={city}>{CITY_NAMES[city]}</option>
            ))}
          </select>
        </label>
        <button type="submit" className={primaryButton}>შენახვა</button>
      </form>

      <JobCard
        title={JOB_NAMES.car_list_update}
        body="სკრეიპერი: იღებს მანქანების ოფიციალურ სიას Yandex Pro-ს გვერდიდან და ბაზაში ინახავს."
        detail={`ბაზაში ჩანაწერი: ${carCount}`}
        running={running}
        action={startCarListAction}
      />

      <Block title="ჩამოტვირთვების ისტორია">
        <JobsTable jobs={jobs} />
      </Block>
    </>
  );
}
