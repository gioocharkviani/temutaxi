import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { secondaryButton } from "@/components/admin/styles";
import { LogoMark } from "@/components/Logo";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../actions";

// The frame around every admin page. The login page sits outside this folder, so it has no menu.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-2">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <LogoMark className="size-9" />
          <p className="font-bold">ადმინ პანელი</p>
          <Link href="/ka" className="ml-auto text-sm font-medium text-muted transition hover:text-ink">საიტის ნახვა</Link>
          <Suspense fallback={null}>
            <SignedInUser />
          </Suspense>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-8">
        <AdminNav />
        <main className="min-w-0 space-y-8">{children}</main>
      </div>
    </div>
  );
}

async function SignedInUser() {
  await connection();
  const admin = await requireAdmin();
  return (
    <>
      <span className="hidden text-sm text-muted sm:inline">{admin.username}</span>
      <form action={logoutAction}>
        <button type="submit" className={secondaryButton}>გასვლა</button>
      </form>
    </>
  );
}
