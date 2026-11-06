import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading, PageTitle } from "@/components/admin/parts";
import { PrivacyForm } from "@/components/admin/PrivacyForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getPrivacyContent } from "@/lib/privacy";

export default function PrivacyAdminPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Privacy />
    </Suspense>
  );
}

async function Privacy() {
  await connection();
  await requireAdmin();
  const content = await getPrivacyContent();

  return (
    <>
      <PageTitle title="Privacy Policy" hint="საიტზე შენახვისთანავე აისახება. ტექსტის შეცვლისას ბოლო განახლების თარიღიც ავტომატურად იცვლება." />
      <PrivacyForm content={content} />
    </>
  );
}
