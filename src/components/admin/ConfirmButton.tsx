"use client";

import type { ReactNode } from "react";

/** A submit button that asks first, for actions that cannot be undone. */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => !window.confirm(message) && e.preventDefault()}>
      {children}
    </button>
  );
}
