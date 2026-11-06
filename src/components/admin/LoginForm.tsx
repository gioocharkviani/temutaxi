"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { adminInput } from "./styles";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold">
        მომხმარებელი
        <input name="username" required autoComplete="username" className={`mt-2 ${adminInput}`} />
      </label>
      <label className="block text-sm font-semibold">
        პაროლი
        <input name="password" type="password" required autoComplete="current-password" className={`mt-2 ${adminInput}`} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl bg-brand font-semibold text-ink transition hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "შესვლა…" : "შესვლა"}
      </button>
    </form>
  );
}
