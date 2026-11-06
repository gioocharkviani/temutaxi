import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/Logo";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-dark px-4 py-10">
      <div className="w-full max-w-sm rounded-[28px] bg-surface p-7 sm:p-9">
        <LogoMark className="size-12" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight">ადმინ პანელი</h1>
        <p className="mt-1 text-sm text-muted">temutaxi.ge</p>
        <LoginForm />
      </div>
    </main>
  );
}
