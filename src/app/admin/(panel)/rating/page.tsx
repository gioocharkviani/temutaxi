import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { archiveRange } from "@/components/admin/archive-format";
import { JobAutoRefresh } from "@/components/admin/JobAutoRefresh";
import { Block, formatTime, JOB_NAMES, JobCard, JobsTable, PageLoading, PageTitle } from "@/components/admin/parts";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { adminCard, secondaryButton } from "@/components/admin/styles";
import type { RatingSettings } from "@/db/entities";
import { requireAdmin } from "@/lib/admin/auth";
import { getLastRatingJob, getRecentJobs } from "@/lib/jobs";
import { getArchivedPeriods } from "@/lib/rating/archive";
import { DEFAULT_RATING_CONTENT } from "@/lib/rating/content";
import { displayName } from "@/lib/rating/names";
import { nextScheduledTime } from "@/lib/rating/schedule";
import { getRating, getRatingSettings } from "@/lib/rating/service";
import { startRatingSyncAction, toggleDriverAction } from "../../actions";

export default function RatingPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Rating />
    </Suspense>
  );
}

const PREVIEW_LIMIT = 100;

async function Rating() {
  // Reads the clock and the database, so it must never be rendered ahead of a real request.
  await connection();
  await requireAdmin();
  const [settings, jobs] = await Promise.all([getRatingSettings(), getRecentJobs(12, "rating_sync")]);
  const running = jobs.some((j) => j.status === "running");

  return (
    <>
      <JobAutoRefresh running={running} />
      <PageTitle title="ლიდერბორდი" />
      <RatingStatus settings={settings} />

      <Block title="განახლება" hint="განრიგს ქვემოთ, პარამეტრებში ირჩევ. ეს ღილაკი ლიდერბორდს ახლავე ანახლებს.">
        <JobCard
          title={JOB_NAMES.rating_sync}
          body="წამოიღებს ლიდერბორდს Yandex-იდან და ბაზაში შეინახავს."
          detail={`ბოლო განახლება: ${formatTime(settings.lastSyncAt)}`}
          running={running}
          action={startRatingSyncAction}
        />
      </Block>

      <Block title="პარამეტრები და ტექსტები">
        <SettingsForm
          settings={{
            enabled: settings.enabled,
            landingCount: settings.landingCount,
            pageCount: settings.pageCount,
            tieBreak: settings.tieBreak,
            syncSchedule: settings.syncSchedule,
            content: settings.content ?? DEFAULT_RATING_CONTENT,
            periodMode: settings.periodMode,
            rollingDays: settings.rollingDays,
            periodStart: settings.periodStart,
            periodEnd: settings.periodEnd,
            categories: settings.categories,
            nameDisplay: settings.nameDisplay,
            minOrders: settings.minOrders,
            showScores: settings.showScores,
            showPrizes: settings.showPrizes,
            prizes: settings.prizes,
          }}
        />
      </Block>

      <Block title="მძღოლები პერიოდში" hint={`ნაჩვენებია მაქსიმუმ ${PREVIEW_LIMIT}. სრული სახელი მხოლოდ ადმინებს უჩანთ.`}>
        <DriverTable settings={settings} />
      </Block>

      <div id="archive" className="scroll-mt-24">
        <Block
          title="დასრულებული პერიოდების შედეგები"
          hint="ფიქსირებული პერიოდის დასრულებისას ბოლო განახლება საბოლოო ცხრილს ბაზაში ინახავს, ერთხელ. ბოლო N დღის რეჟიმს დასასრული არ აქვს და აქ არ ინახება."
        >
          <ArchiveTable />
        </Block>
      </div>

      <Block title="განახლებების ისტორია" hint="ბოლო 12 გაშვება.">
        <JobsTable jobs={jobs} />
      </Block>
    </>
  );
}

function StatusBox({ tone, title, children }: { tone: "good" | "neutral" | "bad"; title: string; children?: React.ReactNode }) {
  const style = { good: "bg-up-soft text-up", neutral: "bg-brand-tint text-ink", bad: "bg-danger-soft text-danger" }[tone];
  return (
    <section role="status" className={`rounded-[20px] p-5 ${style}`}>
      <p className="font-bold">{title}</p>
      {children && <p className="mt-1 text-sm">{children}</p>}
    </section>
  );
}

const SCHEDULE_NAMES = { hourly: "ყოველ საათში", daily: "ღამის 12 საათზე" };

/** Whether the rating is on the site, when it updates and, when something is wrong, exactly why. */
async function RatingStatus({ settings }: { settings: RatingSettings }) {
  if (!settings.enabled) {
    return <StatusBox tone="neutral" title="ლიდერბორდი საიტზე არ ჩანს">გამორთულია პარამეტრებში, ამიტომ არც განახლდება.</StatusBox>;
  }

  const [rating, lastJob] = await Promise.all([getRating(settings), getLastRatingJob()]);
  const failure = lastJob?.status === "failed" ? lastJob.message : null;
  const schedule = `განრიგი: ${SCHEDULE_NAMES[settings.syncSchedule]}. შემდეგი განახლება: ${formatTime(nextScheduledTime(settings.syncSchedule, new Date()))}.`;

  if (!rating) {
    return failure ? (
      <StatusBox tone="bad" title="ლიდერბორდი ვერ განახლდა">{failure} საიტზე ჩანს პირობები და შეტყობინება, რომ რეიტინგი დროებით მიუწვდომელია.</StatusBox>
    ) : (
      <StatusBox tone="neutral" title="ლიდერბორდი ახლდება">არჩეული პერიოდის მონაცემები ჯერ ჩამოტვირთული არ არის. ეს ერთ წუთამდე გრძელდება.</StatusBox>
    );
  }
  if (failure) {
    return (
      <StatusBox tone="bad" title="ბოლო განახლება ვერ მოხერხდა">
        {failure} საიტზე ჩანს წინა მონაცემები: {formatTime(rating.syncedAt)}. {schedule}
      </StatusBox>
    );
  }
  if (rating.visible.length === 0) {
    return <StatusBox tone="neutral" title="ლიდერბორდი ჩართულია, მაგრამ მძღოლები არ არის">ამ პერიოდსა და ტარიფებში შესაბამისი შეკვეთები არ მოიძებნა. საიტზე ჩანს მხოლოდ პირობები. {schedule}</StatusBox>;
  }
  return (
    <StatusBox tone="good" title="ლიდერბორდი ჩანს საიტზე">
      მთავარ გვერდზე: {settings.landingCount}, რეიტინგის გვერდზე: {settings.pageCount}. მძღოლები პერიოდში: {rating.visible.length}.
      ბოლო განახლება: {formatTime(rating.syncedAt)}. {schedule}
    </StatusBox>
  );
}

async function DriverTable({ settings }: { settings: RatingSettings }) {
  const rating = await getRating(settings);
  if (!rating) return <p className={`${adminCard} text-sm text-muted`}>არჩეული პერიოდის მონაცემები ჯერ ჩამოტვირთული არ არის.</p>;

  const hidden = new Set(settings.hiddenDriverIds);
  const positions = new Map(rating.visible.map((r) => [r.driverId, r.position]));
  const rows = rating.all.slice(0, PREVIEW_LIMIT);

  return (
    <div className={`${adminCard} overflow-x-auto`}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">ამ პერიოდში მონაცემები არ არის.</p>
      ) : (
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="pb-2 font-medium">ადგილი</th>
              <th className="pb-2 font-medium">სახელი</th>
              <th className="pb-2 font-medium">საიტზე ასე ჩანს</th>
              <th className="pb-2 font-medium">შეკვეთა</th>
              <th className="pb-2 font-medium">ბოლო შეკვეთა</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isHidden = hidden.has(row.driverId);
              const position = positions.get(row.driverId);
              const inTop = !isHidden && position !== undefined && position <= settings.pageCount;
              return (
                <tr key={row.driverId} className={`border-t border-line-soft ${isHidden ? "text-faint" : ""}`}>
                  <td className={`py-2.5 font-semibold tabular-nums ${inTop ? "text-up" : ""}`}>{isHidden ? "—" : position}</td>
                  <td className="py-2.5">{row.driverName}</td>
                  <td className="py-2.5">{displayName(row.driverName, settings.nameDisplay)}</td>
                  <td className="py-2.5 tabular-nums">{row.score}</td>
                  <td className="py-2.5 text-xs">{formatTime(row.reachedAt)}</td>
                  <td className="py-2.5 text-right">
                    <form action={toggleDriverAction}>
                      <input type="hidden" name="driverId" value={row.driverId} />
                      <button type="submit" className={secondaryButton}>{isHidden ? "გამოჩენა" : "დამალვა"}</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

async function ArchiveTable() {
  const periods = await getArchivedPeriods();
  if (periods.length === 0) {
    return <p className={`${adminCard} text-sm text-muted`}>ჯერ არც ერთი ფიქსირებული პერიოდი არ დასრულებულა.</p>;
  }
  return (
    <div className={`${adminCard} overflow-x-auto`}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr>
            <th className="pb-2 font-medium">პერიოდი</th>
            <th className="pb-2 font-medium">მძღოლი</th>
            <th className="pb-2 font-medium">შეკვეთა</th>
            <th className="pb-2 font-medium">შენახულია</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.id} className="border-t border-line-soft">
              <td className="py-2.5 font-semibold">{archiveRange(p.periodFrom, p.periodTo)}</td>
              <td className="py-2.5 tabular-nums">{p.drivers}</td>
              <td className="py-2.5 tabular-nums">{p.totalOrders}</td>
              <td className="py-2.5 text-xs">{formatTime(p.savedAt)}</td>
              <td className="py-2.5 text-right">
                <Link href={`/admin/rating/archive/${p.id}`} className={secondaryButton}>ნახვა</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
