"use client";

import { useActionState, useState, useTransition } from "react";
import { saveMailAction, sendTestMailAction } from "@/app/admin/actions";
import { adminCard, adminInput, primaryButton, secondaryButton } from "./styles";

export function MailForm({ enabled, recipients, canSend }: { enabled: boolean; recipients: string[]; canSend: boolean }) {
  const [state, action, pending] = useActionState(saveMailAction, {});
  const [, startTransition] = useTransition();
  const [testState, testAction, testing] = useActionState(sendTestMailAction, {});
  const [on, setOn] = useState(enabled);
  const [list, setList] = useState(recipients.length ? recipients : [""]);
  const setAt = (i: number, value: string) => setList((l) => l.map((x, j) => (j === i ? value : x)));

  return (
    <div className="space-y-6">
      <form noValidate onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }} className={`${adminCard} space-y-5`}>
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
          <span>
            <span className="block font-semibold">შეტყობინება ყოველ ახალ განაცხადზე</span>
            <span className="block text-sm text-muted">წერილში არის განაცხადის ყველა მონაცემი, Yandex-ის შედეგი და რეფერალი.</span>
          </span>
          <input type="checkbox" name="enabled" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-6 shrink-0 accent-ink" />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">მიმღებები</legend>
          {list.map((email, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="recipients"
                type="email"
                value={email}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder="name@example.com"
                aria-label={`მიმღები ${i + 1}`}
                className={adminInput}
              />
              <button type="button" onClick={() => setList((l) => (l.length > 1 ? l.filter((_, j) => j !== i) : [""]))} className={secondaryButton} aria-label={`წაშლა: მიმღები ${i + 1}`}>
                წაშლა
              </button>
            </div>
          ))}
          {list.length < 10 && (
            <button type="button" onClick={() => setList((l) => [...l, ""])} className={secondaryButton}>
              + მიმღების დამატება
            </button>
          )}
          {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={primaryButton}>{pending ? "ინახება…" : "შენახვა"}</button>
          {state.saved && !pending && <p role="status" className="text-sm font-medium text-up">შენახულია.</p>}
        </div>
      </form>

      <form action={testAction} className={`${adminCard} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <p className="font-semibold">სატესტო წერილი</p>
          <p className="mt-1 text-sm text-muted">გაიგზავნება შენახულ მიმღებებთან. ჯერ შეინახე სია.</p>
          {testState.error && <p role="alert" className="mt-2 text-sm text-danger">{testState.error}</p>}
          {testState.sent && !testing && <p role="status" className="mt-2 text-sm font-medium text-up">გაიგზავნა. შეამოწმე ფოსტა (Spam-იც).</p>}
        </div>
        <button type="submit" disabled={testing || !canSend} className={primaryButton}>{testing ? "იგზავნება…" : "გაგზავნა"}</button>
      </form>
    </div>
  );
}
