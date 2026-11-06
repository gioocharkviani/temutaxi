"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/app/admin/actions";
import { adminCard, adminInput, primaryButton } from "./styles";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, {});

  return (
    <form action={action} className={`${adminCard} grid gap-4 sm:grid-cols-3`}>
      <label className="block text-sm font-semibold">
        მიმდინარე პაროლი
        <input name="current" type="password" required autoComplete="current-password" className={`mt-2 ${adminInput}`} />
      </label>
      <label className="block text-sm font-semibold">
        ახალი პაროლი
        <input name="next" type="password" required minLength={10} autoComplete="new-password" className={`mt-2 ${adminInput}`} />
      </label>
      <label className="block text-sm font-semibold">
        გაიმეორეთ
        <input name="repeat" type="password" required autoComplete="new-password" className={`mt-2 ${adminInput}`} />
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          პაროლის შეცვლა
        </button>
        {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        {state.saved && <p role="status" className="text-sm font-medium text-up">პაროლი შეიცვალა.</p>}
      </div>
    </form>
  );
}
