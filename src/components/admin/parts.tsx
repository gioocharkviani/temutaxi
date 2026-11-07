// Small building blocks shared by the admin pages.

import type { ReactNode } from "react";
import type { JobRun, JobType } from "@/db/entities";
import { adminCard, primaryButton } from "./styles";

export const formatTime = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat("ka-GE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tbilisi" }).format(date)
    : "—";

export const JOB_NAMES: Record<JobType, string> = {
  rating_sync: "ლიდერბორდის განახლება",
  car_list_update: "მანქანების სიის ჩამოტვირთვა",
};

export function PageTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function PageLoading() {
  return <p className="py-10 text-muted">იტვირთება…</p>;
}

export function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function JobCard({
  title,
  body,
  detail,
  running,
  action,
}: {
  title: string;
  body: string;
  detail: string;
  running: boolean;
  action: () => Promise<void>;
}) {
  return (
    <form action={action} className={`${adminCard} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted">{body}</p>
        <p className="mt-2 text-xs text-muted">{detail}</p>
      </div>
      <button type="submit" disabled={running} className={`${primaryButton} shrink-0 self-start sm:self-auto`}>
        {running ? "მიმდინარეობს…" : "გაშვება"}
      </button>
    </form>
  );
}

const STATUS_STYLE: Record<JobRun["status"], [string, string]> = {
  running: ["მიმდინარეობს", "bg-brand-soft text-ink"],
  success: ["წარმატებული", "bg-up-soft text-up"],
  failed: ["შეცდომა", "bg-danger-soft text-danger"],
};

export function JobsTable({ jobs }: { jobs: JobRun[] }) {
  if (jobs.length === 0) return <p className={`${adminCard} text-sm text-muted`}>ჯერ არ გაშვებულა.</p>;
  return (
    <div className={`${adminCard} overflow-x-auto`}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr>
            <th className="pb-2 font-medium">სტატუსი</th>
            <th className="pb-2 font-medium">დაიწყო</th>
            <th className="pb-2 font-medium">ვინ</th>
            <th className="pb-2 font-medium">შედეგი</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const [label, style] = STATUS_STYLE[job.status];
            return (
              <tr key={job.id} className="border-t border-line-soft align-top">
                <td className="py-2.5 pr-3">
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>{label}</span>
                </td>
                <td className="whitespace-nowrap py-2.5 pr-3 text-xs">{formatTime(job.startedAt)}</td>
                <td className="py-2.5 pr-3 text-xs">{job.triggeredBy}</td>
                <td className="py-2.5 text-xs">
                  {job.items !== null && <span className="font-semibold">{job.items} ჩანაწერი. </span>}
                  {job.message}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
