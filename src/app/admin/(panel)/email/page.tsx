import { connection } from "next/server";
import { Suspense } from "react";
import { MailForm } from "@/components/admin/MailForm";
import { formatTime, PageLoading, PageTitle } from "@/components/admin/parts";
import { adminCard } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { getMailSettings, smtpStatus } from "@/lib/mail";

export default function EmailPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Email />
    </Suspense>
  );
}

async function Email() {
  await connection();
  await requireAdmin();
  const { settings, last } = await getMailSettings();
  const smtp = smtpStatus();

  return (
    <>
      <PageTitle title="ელფოსტა" hint="ვის მიუვიდეს წერილი, როცა საიტზე ახალი განაცხადი შემოვა." />

      <section className={`${adminCard} space-y-2 text-sm`}>
        <h2 className="text-lg font-bold">გამგზავნი (SMTP)</h2>
        {smtp.configured ? (
          <dl className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)]">
            <dt className="text-muted">სერვერი</dt>
            <dd className="font-semibold">{smtp.host}:{smtp.port}</dd>
            <dt className="text-muted">მომხმარებელი</dt>
            <dd className="break-all font-semibold">{smtp.user}</dd>
            <dt className="text-muted">გამგზავნი</dt>
            <dd className="break-all font-semibold">{smtp.from}</dd>
          </dl>
        ) : (
          <div className="space-y-2 text-ink-2">
            <p className="font-semibold text-danger">SMTP ჯერ არ არის მითითებული, ამიტომ წერილები ვერ გაიგზავნება.</p>
            <p>სერვერის <code>.env</code>-ში დაამატე (Gmail-ის შემთხვევაში პაროლად App password, არა ჩვეულებრივი პაროლი) და გადატვირთე აპლიკაცია:</p>
            <pre className="overflow-x-auto rounded-xl bg-surface-2 p-3 text-xs">{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=TemuTaxi <yourname@gmail.com>`}</pre>
          </div>
        )}
        {last && (
          <p className={`pt-2 ${last.ok ? "text-up" : "text-danger"}`}>
            ბოლო გაგზავნა ({formatTime(new Date(last.at))}): {last.message}
          </p>
        )}
      </section>

      <MailForm enabled={settings.enabled} recipients={settings.recipients} canSend={smtp.configured} />
    </>
  );
}
