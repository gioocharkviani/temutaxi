import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading, PageTitle } from "@/components/admin/parts";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { requireAdmin } from "@/lib/admin/auth";

export default function PasswordPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Password />
    </Suspense>
  );
}

async function Password() {
  await connection();
  await requireAdmin();

  return (
    <>
      <PageTitle title="პაროლი" />
      <PasswordForm />
    </>
  );
}
